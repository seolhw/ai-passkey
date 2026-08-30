/** HTML 转纯文本（去除标签，保留换行） */
export function htmlToText(html: string) {
	const doc = new DOMParser().parseFromString(html, "text/html");
	// 块级元素后补换行，列表项加前缀
	doc
		.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr, br")
		.forEach((el) => {
			el.appendChild(document.createTextNode("\n"));
		});
	doc.querySelectorAll("li").forEach((el) => {
		el.insertBefore(document.createTextNode("- "), el.firstChild);
	});
	const text = doc.body.textContent ?? "";
	return text.replace(/\n{3,}/g, "\n\n").trim();
}

/** 纯文本转 HTML（段落化） */
export function textToHtml(text: string) {
	return text
		.split(/\n+/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => `<p>${escapeHtml(line)}</p>`)
		.join("");
}

/** HTML 转义 */
export function escapeHtml(s: string) {
	return s
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

/** 从 File 解析文本：支持 pdf / docx / txt / md */
export async function parseFileToPlainText(file: File) {
	const name = file.name.toLowerCase();
	if (name.endsWith(".pdf")) {
		return await parsePdf(file);
	}
	if (name.endsWith(".docx")) {
		return await parseDocx(file);
	}
	if (name.endsWith(".doc")) {
		throw new Error("暂不支持旧版 .doc，请另存为 .docx 后上传");
	}
	return await file.text();
}

async function parsePdf(file: File) {
	const pdfjs = await import("pdfjs-dist");
	// 配置 pdfjs worker（Vite 环境用打包产物）
	pdfjs.GlobalWorkerOptions.workerSrc = new URL(
		"pdfjs-dist/build/pdf.worker.min.mjs",
		import.meta.url,
	).toString();
	const buf = await file.arrayBuffer();
	const pdf = await pdfjs.getDocument({ data: buf }).promise;
	let text = "";
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content = await page.getTextContent();
		const pageText = content.items
			.map((item) => ("str" in item ? item.str : ""))
			.join(" ");
		text += `${pageText}\n\n`;
	}
	return text.trim();
}

async function parseDocx(file: File) {
	const mammoth = await import("mammoth");
	const result = await mammoth.extractRawText({
		arrayBuffer: await file.arrayBuffer(),
	});
	return result.value.trim();
}
