const fs=require("fs"),path=require("path");const pt=require("puppeteer-core");
const src=process.argv[2], out=process.argv[3];
const md=fs.readFileSync(src,"utf8").split(/\r?\n/);
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const inl=s=>esc(s).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>").replace(/\*([^*]+)\*/g,"<i>$1</i>");
let html=[],i=0,list=null;
const closeList=()=>{if(list){html.push(`</${list}>`);list=null;}};
while(i<md.length){const l=md[i];
 if(/^#\s/.test(l)){closeList();html.push(`<h1>${inl(l.slice(2))}</h1>`);i++;continue;}
 if(/^##\s/.test(l)){closeList();html.push(`<h2>${inl(l.slice(3))}</h2>`);i++;continue;}
 if(/^###\s/.test(l)){closeList();html.push(`<h3>${inl(l.slice(4))}</h3>`);i++;continue;}
 if(/^\|/.test(l)){closeList();const rows=[];while(i<md.length&&/^\|/.test(md[i])){rows.push(md[i]);i++;}
   const cells=r=>r.replace(/^\||\|$/g,"").split("|").map(c=>inl(c.trim()));
   const body=rows.filter(r=>!/^\|[\s:-]+\|/.test(r)||!/^[\s|:-]+$/.test(r));
   const hdr=cells(body[0]);html.push("<table><thead><tr>"+hdr.map(c=>`<th>${c}</th>`).join("")+"</tr></thead><tbody>");
   for(const r of body.slice(1)){html.push("<tr>"+cells(r).map(c=>`<td>${c}</td>`).join("")+"</tr>");}
   html.push("</tbody></table>");continue;}
 let m;
 if((m=/^(\d+)\.\s+(.*)/.exec(l))){if(list!=="ol"){closeList();html.push("<ol>");list="ol";}html.push(`<li>${inl(m[2])}</li>`);i++;continue;}
 if((m=/^[-*]\s+(.*)/.exec(l))){if(list!=="ul"){closeList();html.push("<ul>");list="ul";}html.push(`<li>${inl(m[1])}</li>`);i++;continue;}
 if(l.trim()===""){closeList();i++;continue;}
 closeList();html.push(`<p>${inl(l)}</p>`);i++;}
closeList();
const css=`@page{size:A4;margin:18mm 16mm}body{font-family:Inter,Segoe UI,Arial,sans-serif;font-size:10.5pt;line-height:1.5;color:#1C1917}h1{font-size:20pt;line-height:1.2;margin:0 0 6pt;letter-spacing:-.02em}h2{font-size:13.5pt;margin:18pt 0 6pt;padding-top:8pt;border-top:2px solid #D9480F;letter-spacing:-.01em}h3{font-size:11.5pt;margin:12pt 0 4pt}p{margin:0 0 7pt}ol,ul{margin:0 0 8pt;padding-left:18pt}li{margin:0 0 4pt}code{font-family:Consolas,Menlo,monospace;font-size:9pt;color:#9A3412;background:#FBE7D3;padding:0 3px;border-radius:3px}table{border-collapse:collapse;width:100%;margin:6pt 0 10pt;font-size:9pt;page-break-inside:avoid}th,td{border:1px solid #DBD2C4;padding:5pt 6pt;vertical-align:top;text-align:left}th{background:#ECE6DC}b{font-weight:600}.foot{margin-top:20pt;font-size:8.5pt;color:#6B645E;border-top:1px solid #DBD2C4;padding-top:6pt}`;
const doc=`<!doctype html><html lang="sv"><head><meta charset="utf-8"><style>${css}</style></head><body>${html.join("\n")}<p class="foot">jobbcoach.ai · saas-lead · ${path.basename(src)}</p></body></html>`;
const htmlOut=out.replace(/\.pdf$/,".html");fs.writeFileSync(htmlOut,doc);
(async()=>{const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(p=>fs.existsSync(p));
 const b=await pt.launch({executablePath:exe,headless:true});const p=await b.newPage();await p.setContent(doc,{waitUntil:"load"});
 await p.pdf({path:out,format:"A4",printBackground:true,displayHeaderFooter:true,headerTemplate:"<span></span>",footerTemplate:'<div style="width:100%;font-size:8px;color:#6B645E;text-align:right;padding-right:16mm">Sida <span class="pageNumber"></span> av <span class="totalPages"></span></div>',margin:{top:"18mm",bottom:"18mm",left:"16mm",right:"16mm"}});
 await b.close();console.log("pdf ok");})();
