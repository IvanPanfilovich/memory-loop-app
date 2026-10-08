const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const normalizeNewlines = (text: string): string => text.replace(/\r\n/g, '\n');

const escapeXml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toW3cdtf = (date: Date): string => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

const createDocumentXml = (text: string): string => {
  const normalized = normalizeNewlines(text);
  const lines = normalized.split('\n');

  const paragraphs = lines
    .map(line => {
      const escaped = escapeXml(line);
      return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${paragraphs}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;
};

export const createDocxFileFromText = async (
  text: string,
  fileName: string = 'notes.docx'
): Promise<File> => {
  const jszipImport = (await import('jszip')) as unknown as {
    default?: typeof import('jszip');
  };
  const JSZip = jszipImport.default ?? (jszipImport as unknown as typeof import('jszip'));

  const finalFileName = fileName.toLowerCase().endsWith('.docx') ? fileName : `${fileName}.docx`;
  const now = new Date();

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

  const documentRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>`;

  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(finalFileName)}</dc:title>
  <dc:creator>Memory Loop</dc:creator>
  <cp:lastModifiedBy>Memory Loop</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${toW3cdtf(now)}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${toW3cdtf(now)}</dcterms:modified>
</cp:coreProperties>`;

  const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Memory Loop</Application>
</Properties>`;

  const documentXml = createDocumentXml(text);

  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypesXml);
  zip.folder('_rels')?.file('.rels', relsXml);
  zip.folder('docProps')?.file('core.xml', coreXml);
  zip.folder('docProps')?.file('app.xml', appXml);
  zip.folder('word')?.file('document.xml', documentXml);
  zip.folder('word')?.file('styles.xml', stylesXml);
  zip.folder('word')?.folder('_rels')?.file('document.xml.rels', documentRelsXml);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: DOCX_MIME_TYPE });
  return new File([blob], finalFileName, { type: DOCX_MIME_TYPE });
};

export const extractRawTextFromDocxFile = async (file: File): Promise<string> => {
  const mammothModule = await import('mammoth');
  const mammoth = (mammothModule.default ?? mammothModule) as typeof import('mammoth');

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
};
