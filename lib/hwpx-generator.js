/**
 * hwpx 동의서 생성 라이브러리 (Node.js)
 *
 * consent-hwpx 스킬의 Python 스크립트를 Node.js로 포팅.
 * Vercel Serverless Functions에서 실행 가능.
 *
 * 핵심: section0.xml 치환 후 linesegarray를 반드시 제거해야 한컴에서 정상 열림.
 */

import JSZip from "jszip";

// 케이스별 원본 hwpx 매핑
const CASE_ORIGINALS = {
  foreign_no_signup: "foreign_no_signup.hwpx",
  foreign_with_signup: null, // foreign_no_signup을 base로 사용
  domestic_no_signup: "domestic_no_signup.hwpx",
  domestic_with_signup: "domestic_with_signup.hwpx",
};

/**
 * section0.xml에서 플레이스홀더 치환 + linesegarray 제거
 */
function applyReplacements(secXml, {
  service_name,
  collect_items,
  retention_period,
  transfer_country = "",
  transfer_method = "",
  third_party_items = "",
  case_type = "",
}) {
  // 서비스명 치환
  secXml = secXml.replaceAll("[## 에듀테크 서비스 명칭]", service_name);

  // 수집항목 치환
  secXml = secXml.replaceAll(
    "[## 학년, 반, 번호, 성명 (업체에서 수집하는 항목에 따라 내용 변경)]",
    collect_items
  );

  // 보유기간 치환
  secXml = secXml.replaceAll("[## N년]", retention_period);

  // 제3자 제공 항목 치환
  const tpItems = third_party_items || collect_items;
  secXml = secXml.replaceAll(
    "[## 학년, 반, 번호, 성명, 학습 수행 데이터 (업체에서 수집하는 항목에 따라 내용 변경)]",
    tpItems
  );
  secXml = secXml.replaceAll(
    "[## 학년, 반, 번호, 성명, 학습수행 데이터 (업체에서 수집하는 항목에 따라 내용 변경)]",
    tpItems
  );

  // 국외기업 전용 치환
  if (case_type.startsWith("foreign")) {
    secXml = secXml.replaceAll(
      "[## 에듀테크 업체가 속한 미국]",
      transfer_country || "미국"
    );

    const method = transfer_method || "활용 동의 후 클라우드 서버를 통한 자동 전송";
    // 이전 방법 치환 (정규식 - 복잡한 XML 구조)
    const methodPattern = /\[## 시기 및 방법 \(예시\) <\/hp:t><\/hp:run><hp:run charPrIDRef="(\d+)"><hp:t>활용 동의 후 클라우드 서버를 통한 자동 전송\]/g;
    secXml = secXml.replace(methodPattern, (match, charRef) => {
      return `${method}</hp:t></hp:run><hp:run charPrIDRef="${charRef}"><hp:t>`;
    });
  }

  // foreign_with_signup 전용: 목적 확장
  if (case_type === "foreign_with_signup") {
    secXml = secXml.replaceAll(
      "교육과정 운영 및 교과 활동",
      `교육과정 운영 및 교과 활동, ${service_name} 이용 약관 준수 및 회원 가입, 학습 관리`
    );
  }

  // 핵심!! linesegarray 제거
  secXml = secXml.replace(/<hp:linesegarray>[\s\S]*?<\/hp:linesegarray>/g, "");

  return secXml;
}

/**
 * 중첩 <hp:tr> 태그를 올바르게 추출 (nested tr 대응)
 */
function extractTrsNested(secXml) {
  const trs = [];
  let pos = 0;
  while (true) {
    const start = secXml.indexOf("<hp:tr>", pos);
    if (start === -1) break;
    let depth = 0;
    let i = start;
    while (i < secXml.length) {
      if (secXml.substring(i, i + 7) === "<hp:tr>") {
        depth++;
        i += 7;
      } else if (secXml.substring(i, i + 8) === "</hp:tr>") {
        depth--;
        i += 8;
        if (depth === 0) {
          trs.push(secXml.substring(start, i));
          pos = i;
          break;
        }
      } else {
        i++;
      }
    }
    if (i >= secXml.length) break;
  }
  return trs;
}

/**
 * tr 블록의 rowAddr 값을 offset만큼 증가
 */
function updateRowAddrs(trBlock, rowOffset) {
  return trBlock.replace(/rowAddr="(\d+)"/g, (match, addr) => {
    return `rowAddr="${parseInt(addr) + rowOffset}"`;
  });
}

/**
 * hwpx ZIP 패키징 (section0.xml만 교체)
 */
async function packageHwpx(baseZipBuffer, sectionXml) {
  const baseZip = await JSZip.loadAsync(baseZipBuffer);
  const newZip = new JSZip();

  // 기존 파일 복사 + section0.xml만 교체
  for (const [filename, file] of Object.entries(baseZip.files)) {
    if (file.dir) {
      newZip.folder(filename);
      continue;
    }
    if (filename === "Contents/section0.xml") {
      newZip.file(filename, sectionXml, { compression: "DEFLATE" });
    } else {
      const content = await file.async("arraybuffer");
      const compression = file._data?.compression?.magic === 0 ? "STORE" : "DEFLATE";
      newZip.file(filename, content, { compression });
    }
  }

  return await newZip.generateAsync({ type: "arraybuffer" });
}

/**
 * 케이스에 맞는 원본 hwpx 파일명 반환
 */
function getOrigFilename(caseType) {
  const filename = CASE_ORIGINALS[caseType];
  if (filename === null) {
    return CASE_ORIGINALS["foreign_no_signup"];
  }
  return filename;
}

/**
 * 단건 동의서 hwpx 생성
 *
 * @param {Object} service - DB에서 가져온 서비스 데이터
 * @param {Object} templates - { "foreign_no_signup.hwpx": ArrayBuffer, ... }
 * @returns {ArrayBuffer} - 생성된 hwpx 파일 버퍼
 */
export async function createConsentHwpx(service, templates) {
  const caseType = service.case_type || deriveCaseType(service);
  const origFilename = getOrigFilename(caseType);
  const templateBuffer = templates[origFilename];

  if (!templateBuffer) {
    throw new Error(`Template not found: ${origFilename}`);
  }

  const baseZip = await JSZip.loadAsync(templateBuffer);
  let secXml = await baseZip.file("Contents/section0.xml").async("string");

  secXml = applyReplacements(secXml, {
    service_name: service.name,
    collect_items: service.items || "학년, 반, 번호, 성명",
    retention_period: service.retention || "회원 탈퇴 시 또는 수집·이용 목적 달성 시까지",
    transfer_country: service.transfer_country || "",
    transfer_method: service.transfer_method || "",
    third_party_items: service.third_party_items || "",
    case_type: caseType,
  });

  return await packageHwpx(templateBuffer, secXml);
}

/**
 * 합본 동의서 hwpx 생성 (여러 서비스)
 *
 * @param {Array} services - DB에서 가져온 서비스 데이터 배열
 * @param {Object} templates - { "foreign_no_signup.hwpx": ArrayBuffer, ... }
 * @returns {ArrayBuffer} - 생성된 합본 hwpx 파일 버퍼
 */
export async function createCombinedConsentHwpx(services, templates) {
  if (!services || services.length === 0) {
    throw new Error("services list is empty");
  }
  if (services.length === 1) {
    return createConsentHwpx(services[0], templates);
  }

  // 첫 번째 서비스를 base로 사용
  const first = services[0];
  const firstCaseType = first.case_type || deriveCaseType(first);
  const firstOrigFilename = getOrigFilename(firstCaseType);
  const firstTemplate = templates[firstOrigFilename];

  if (!firstTemplate) {
    throw new Error(`Template not found: ${firstOrigFilename}`);
  }

  const baseZip = await JSZip.loadAsync(firstTemplate);
  let baseSec = await baseZip.file("Contents/section0.xml").async("string");

  baseSec = applyReplacements(baseSec, {
    service_name: first.name,
    collect_items: first.items || "학년, 반, 번호, 성명",
    retention_period: first.retention || "회원 탈퇴 시 또는 수집·이용 목적 달성 시까지",
    transfer_country: first.transfer_country || "",
    transfer_method: first.transfer_method || "",
    third_party_items: first.third_party_items || "",
    case_type: firstCaseType,
  });

  const baseTrs = extractTrsNested(baseSec);
  const baseServiceRows = baseTrs.length - 1;

  const extraTrs = [];
  let rowOffset = baseServiceRows + 1;

  // 나머지 서비스들의 행을 추출하여 합침
  for (const svc of services.slice(1)) {
    const svcCaseType = svc.case_type || deriveCaseType(svc);
    const svcOrigFilename = getOrigFilename(svcCaseType);
    const svcTemplate = templates[svcOrigFilename];

    if (!svcTemplate) {
      throw new Error(`Template not found: ${svcOrigFilename}`);
    }

    const svcZip = await JSZip.loadAsync(svcTemplate);
    let svcSec = await svcZip.file("Contents/section0.xml").async("string");

    svcSec = applyReplacements(svcSec, {
      service_name: svc.name,
      collect_items: svc.items || "학년, 반, 번호, 성명",
      retention_period: svc.retention || "회원 탈퇴 시 또는 수집·이용 목적 달성 시까지",
      transfer_country: svc.transfer_country || "",
      transfer_method: svc.transfer_method || "",
      third_party_items: svc.third_party_items || "",
      case_type: svcCaseType,
    });

    const svcTrs = extractTrsNested(svcSec);
    const svcServiceTrs = svcTrs.slice(1); // 헤더 행 제외

    for (const tr of svcServiceTrs) {
      // 큰 고정 높이값을 자동 높이(0)로 변경 → 한컴이 열 때 자동 재계산
      let adjusted = updateRowAddrs(tr, rowOffset - 1);
      adjusted = adjusted.replace(/height="(\d+)"/g, (match, h) => {
        return parseInt(h) > 5000 ? 'height="0"' : match;
      });
      extraTrs.push(adjusted);
    }
    rowOffset += svcServiceTrs.length;
  }

  // 합본 XML 생성
  const lastTrEnd = baseSec.lastIndexOf("</hp:tr>") + "</hp:tr>".length;
  const tblClose = baseSec.indexOf("</hp:tbl>", lastTrEnd);
  const combinedSec = baseSec.substring(0, lastTrEnd) + extraTrs.join("") + baseSec.substring(tblClose);

  // rowCnt 업데이트
  const totalRows = rowOffset;
  const finalSec = combinedSec.replace(/rowCnt="\d+"/, `rowCnt="${totalRows}"`);

  return await packageHwpx(firstTemplate, finalSec);
}

/**
 * overseas_transfer / guardian_consent로부터 case_type 유도
 * (기존 데이터 호환용)
 */
function deriveCaseType(service) {
  const isOverseas = service.overseas_transfer;
  const isGuardian = service.guardian_consent;

  if (isOverseas && isGuardian) return "foreign_with_signup";
  if (isOverseas && !isGuardian) return "foreign_no_signup";
  if (!isOverseas && isGuardian) return "domestic_with_signup";
  return "domestic_no_signup";
}
