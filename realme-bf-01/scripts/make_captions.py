# Gera as legendas (texto revisado + tempos da voz cortada) para o Remotion, .srt e .ass.
import json,sys
root=sys.argv[1]
d=json.load(open(f"{root}/analysis/transcript_cut.json"))
words=[(w["w"],w["s"],w["e"]) for s in d for w in s["words"]]
# correções por índice de palavra: substitui um intervalo [i,j) por novas palavras (texto, verde?)
fix={
 "puder":"pudesse","significa":"sem","estiver":"estiverem","Realme":"realme","Realme,":"realme,",
 "Então":"Então","Shop":"Shopping",
}
out=[]
i=0
while i<len(words):
    w,s,e=words[i]; nxt=words[i+1][0] if i+1<len(words) else ""
    if w=="Pra" and nxt=="Black": out.append(["pré-Black",s,words[i+1][2],False]); i+=2; continue
    if w=="mil" and nxt.startswith("reais"): out.append(["R$ 1.000.",s,words[i+1][2],True]); i+=2; continue
    if w=="um" and nxt.startswith("real"): out.append(["R$ 1"+("?" if False else ("." if nxt[-1] in ".?" else "")),s,words[i+1][2],True]); i+=2; continue
    if w=="Carapico": out.append(["Carapicuíba.",s,words[i+1][2],False]); i+=2; continue
    if w=="garantiu" and out and out[-1][0]=="você" and out[-2][0]=="Black": w="garante"
    out.append([fix.get(w,w),s,e,False]); i+=1
# fecha a pergunta do gancho
for o in out:
    if o[0]=="hora.": o[0]="hora?"
# páginas: até 4 palavras, quebra em pontuação ou pausa > 0.35 s
pages=[];cur=[]
for k,o in enumerate(out):
    cur.append(o)
    gap=(out[k+1][1]-o[2]) if k+1<len(out) else 9
    if len(cur)==4 or o[0][-1] in ".,?!" or gap>0.35 or (o[3] and len(cur)>=2):
        pages.append(cur);cur=[]
if cur: pages.append(cur)
# grava TS
ts="// Gerado por scripts/make_captions.py (tempos em segundos, timeline final)\nexport type Word={t:string;s:number;e:number;money:boolean};\nexport const PAGES:Word[][]="+json.dumps([[{"t":t,"s":round(s,2),"e":round(e,2),"money":m} for t,s,e,m in p] for p in pages],ensure_ascii=False)+";\n"
open(f"{root}/motion/src/captions.ts","w").write(ts)
def tc(x,ass=False):
    h=int(x//3600);m=int(x%3600//60);s=x%60
    return f"{h}:{m:02d}:{s:05.2f}" if ass else f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s-int(s))*1000)):03d}"
srt=[];ass=[]
for n,p in enumerate(pages,1):
    a=p[0][1]; b=p[-1][2]+0.15
    if n<len(pages): b=min(b,pages[n][0][1])
    txt=" ".join(w[0] for w in p)
    srt.append(f"{n}\n{tc(a)} --> {tc(b)}\n{txt}\n")
    kt="".join(("{\\c&H6BE62E&}" if w[3] else "{\\c&HFFFFFF&}")+"{\\k%d}"%round((w[2]-w[1])*100)+w[0]+" " for w in p).strip()
    ass.append(f"Dialogue: 0,{tc(a,1)},{tc(b,1)},Default,,0,0,0,,{kt}")
open(f"{root}/out/legendas.srt","w").write("\n".join(srt))
open(f"{root}/out/legendas.ass","w").write("""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Inter Black,74,&H00FFFFFF,&H8CFFFFFF,&H64000000,&H8C000000,1,0,0,0,100,100,0,0,1,2,3,2,108,108,380,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""+"\n".join(ass)+"\n")
for p in pages: print(" | ".join(f"{w[0]}" for w in p), f"  [{p[0][1]:.2f}-{p[-1][2]:.2f}]")
