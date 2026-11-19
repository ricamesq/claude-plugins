// Vídeo-aula a partir de public/roteiro.json. Cada cena tem um tipo, uma duração em segundos e a legenda
// (o texto que é dito naquela cena). Os elementos de cada cena entram no segundo indicado em "em".
import React from 'react';
import {
	AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile,
	useCurrentFrame, useVideoConfig,
} from 'remotion';
import {loadFont as carregaRubik} from '@remotion/google-fonts/Rubik';
import {loadFont as carregaPublicSans} from '@remotion/google-fonts/PublicSans';
import roteiro from '../public/roteiro.json';

export const FPS = 30;
const {fontFamily: TITULO} = carregaRubik();
const {fontFamily: CORPO} = carregaPublicSans();
// uma cor para cada função, a mesma em todas as cenas
const COR = {fundo: '#0A1420', texto: '#E8EEF2', apagado: '#9FB3C8', rotulo: '#45C4C6', caixa: '#1E8C8E',
	resultado: '#F2B134', barra: '#D64545', ...((roteiro as any).cores ?? {})};

type Cena = {
	tipo: 'imagem' | 'conta' | 'barras' | 'cartoes' | 'fecho'; duracao: number; legenda?: string;
	legenda_trechos?: {em: number; texto: string}[];
	imagem?: string; pulso?: number; titulo?: string; subtitulo?: string;
	rotulos?: {em: number; texto: string; x: number; y: number}[];
	destaque?: {em: number; texto: string; subtexto?: string};
	linhas?: {em: number; texto: string; resultado?: boolean}[];
	unidade?: string; barras?: {em: number; rotulo: string; valor: number}[];
	itens?: {em: number; nome: string; descricao: string}[];
};
const CENAS = (roteiro as any).cenas as Cena[];
const q = (s: number) => Math.round(s * FPS);
export const duracaoTotal = () => CENAS.reduce((t, c) => t + q(c.duracao), 0);

const Entra: React.FC<{em: number; children: React.ReactNode; style?: React.CSSProperties}> = (
	{em, children, style}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: f - q(em), fps, config: {damping: 200}, durationInFrames: 15});
	return <div style={{...style, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>{children}</div>;
};

const Titulo: React.FC<{t?: string}> = ({t}) => t ? (
	<div style={{position: 'absolute', top: 60, width: '100%', textAlign: 'center', fontFamily: TITULO,
		fontWeight: 700, fontSize: 58, color: COR.texto}}>{t}</div>) : null;

// tamanho real da imagem, para levar o ponto do rótulo (fração da imagem) ao lugar certo depois do recorte
const useTamanho = (arquivo?: string) => {
	const [tam, setTam] = React.useState<{w: number; h: number} | null>(null);
	const [espera] = React.useState(() => (arquivo ? delayRender('tamanho de ' + arquivo) : null));
	React.useEffect(() => {
		if (!arquivo || espera === null) return;
		const im = new Image();
		im.onload = () => { setTam({w: im.naturalWidth, h: im.naturalHeight}); continueRender(espera); };
		im.onerror = () => { setTam({w: 1920, h: 1080}); continueRender(espera); };
		im.src = staticFile(arquivo);
	}, [arquivo, espera]);
	return tam;
};

const CenaImagem: React.FC<{c: Cena}> = ({c}) => {
	const f = useCurrentFrame();
	const tam = useTamanho(c.imagem);
	// imagem larga preenche a tela (recorta as bordas); vertical ou quadrada aparece inteira, com fundo dos lados
	const cobre = !tam || tam.w / tam.h >= 1.5;
	const k = tam ? (cobre ? Math.max : Math.min)(1920 / tam.w, 1080 / tam.h) : 1;
	// ponto na imagem -> ponto na tela, já com a aproximação lenta (escala em torno do centro) aplicada à imagem
	const naTela = (x: number, y: number) => {
		const [sx, sy] = tam
			? [x * tam.w * k + (1920 - tam.w * k) / 2, y * tam.h * k + (1080 - tam.h * k) / 2] : [x * 1920, y * 1080];
		return [960 + (sx - 960) * escala, 540 + (sy - 540) * escala];
	};
	let escala = interpolate(f, [0, q(c.duracao)], [1, 1.05]);
	if (c.pulso) {                       // batimento: contração rápida, relaxamento lento
		const periodo = (60 / c.pulso) * FPS, fase = (f % periodo) / periodo;
		escala *= 1 - 0.022 * Math.exp(-fase * 9) * Math.min(fase * 12, 1);
	}
	return (
		<AbsoluteFill style={{backgroundColor: COR.fundo}}>
			{c.imagem && <Img src={staticFile(c.imagem)} style={{width: '100%', height: '100%', objectFit: cobre ? 'cover' : 'contain',
				transform: `scale(${escala})`}}/>}
			{c.titulo && (
				<Entra em={0.5} style={{position: 'absolute', left: 110, top: 330, width: 560}}>
					<div style={{fontFamily: TITULO, fontWeight: 700, fontSize: 92, color: COR.texto, lineHeight: 1.05}}>
						{c.titulo}</div>
					{c.subtitulo && <div style={{fontFamily: CORPO, fontSize: 38, color: COR.rotulo, marginTop: 24}}>
						{c.subtitulo}</div>}
				</Entra>
			)}
			{c.rotulos?.map((r) => {
				const [px, py] = naTela(r.x, r.y), xRot = 700;
				const p = interpolate(f - q(r.em), [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return (
					<React.Fragment key={r.texto}>
						<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
							<line x1={xRot} y1={py} x2={xRot + (px - xRot) * p} y2={py} stroke={COR.rotulo} strokeWidth={4}/>
							<circle cx={px} cy={py} r={14 * p} fill={COR.resultado}/>
						</svg>
						<div style={{position: 'absolute', right: 1920 - xRot + 16, top: py - 32, opacity: p,
							fontFamily: TITULO, fontWeight: 700, fontSize: 48, color: COR.rotulo, whiteSpace: 'nowrap'}}>
							{r.texto}</div>
					</React.Fragment>
				);
			})}
			{c.destaque && (
				<Entra em={c.destaque.em} style={{position: 'absolute', left: 140, top: 300}}>
					<div style={{fontFamily: TITULO, fontWeight: 700, fontSize: 150, color: COR.resultado}}>
						{c.destaque.texto}</div>
					{c.destaque.subtexto && <div style={{fontFamily: CORPO, fontSize: 40, color: COR.texto}}>
						{c.destaque.subtexto}</div>}
				</Entra>
			)}
		</AbsoluteFill>
	);
};

const CenaConta: React.FC<{c: Cena}> = ({c}) => (
	<AbsoluteFill style={{backgroundColor: COR.fundo, alignItems: 'center', paddingTop: 200, gap: 30}}>
		<Titulo t={c.titulo}/>
		{c.linhas!.map((l, i) => (
			<Entra key={i} em={l.em}>
				<div style={{fontFamily: TITULO, fontWeight: 700, fontSize: i === 0 ? 96 : 72,
					color: l.resultado ? COR.resultado : COR.texto}}>{l.texto}</div>
			</Entra>
		))}
	</AbsoluteFill>
);

const CenaBarras: React.FC<{c: Cena}> = ({c}) => {
	const f = useCurrentFrame();
	const barras = (c.barras ?? []).filter((b) => Number.isFinite(b.valor) && b.valor > 0);
	if (!barras.length) throw new Error('cena de barras sem nenhum valor positivo: confira o roteiro.json');
	const max = Math.max(...barras.map((b) => b.valor)), altura = 520, base = 820;
	return (
		<AbsoluteFill style={{backgroundColor: COR.fundo}}>
			<Titulo t={c.titulo}/>
			<div style={{position: 'absolute', left: 160, right: 160, top: base, height: 3, background: COR.apagado}}/>
			{barras.map((b, i) => {
				const n = barras.length, x = 960 + (i - (n - 1) / 2) * 520;
				const p = interpolate(f - q(b.em), [0, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				const h = (b.valor / max) * altura * p;
				return (
					<React.Fragment key={i}>
						<div style={{position: 'absolute', left: x - 110, width: 220, top: base - h, height: h,
							background: COR.barra}}/>
						<div style={{position: 'absolute', left: x - 200, width: 400, top: base - h - 70, opacity: p,
							textAlign: 'center', fontFamily: TITULO, fontWeight: 700, fontSize: 48, color: COR.texto}}>
							{b.valor.toLocaleString('pt-BR')} {c.unidade}</div>
						<div style={{position: 'absolute', left: x - 250, width: 500, top: base + 14, opacity: p,
							textAlign: 'center', fontFamily: CORPO, fontSize: 34, color: COR.apagado}}>{b.rotulo}</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};

const CenaCartoes: React.FC<{c: Cena}> = ({c}) => (
	<AbsoluteFill style={{backgroundColor: COR.fundo, flexDirection: 'row', justifyContent: 'center',
		alignItems: 'center', gap: 50, paddingBottom: 120}}>
		<Titulo t={c.titulo}/>
		{c.itens!.map((it, i) => (
			<Entra key={i} em={it.em}>
				<div style={{width: 480, height: 330, borderRadius: 24, border: `4px solid ${COR.caixa}`,
					background: 'rgba(30, 140, 142, 0.18)', display: 'flex', flexDirection: 'column',
					alignItems: 'center', justifyContent: 'center', gap: 22, padding: 28, textAlign: 'center'}}>
					<div style={{fontFamily: TITULO, fontWeight: 700, fontSize: 52, color: COR.rotulo}}>{it.nome}</div>
					<div style={{fontFamily: CORPO, fontSize: 38, color: COR.texto}}>{it.descricao}</div>
				</div>
			</Entra>
		))}
	</AbsoluteFill>
);

const CenaFecho: React.FC<{c: Cena}> = ({c}) => (
	<AbsoluteFill style={{backgroundColor: COR.fundo, justifyContent: 'center', alignItems: 'center',
		padding: '0 220px', gap: 18, textAlign: 'center'}}>
		{c.linhas!.map((l, i) => (
			<Entra key={i} em={l.em}>
				<div style={{fontFamily: i === 0 ? TITULO : CORPO, fontWeight: i === 0 ? 700 : 400,
					fontSize: i === 0 ? 60 : 30, color: i === 0 ? COR.texto : COR.apagado, lineHeight: 1.35}}>
					{l.texto}</div>
			</Entra>
		))}
	</AbsoluteFill>
);

// legenda: com legenda_trechos, cada trecho entra no segundo marcado (acompanha a narração); só com legenda,
// o texto é dividido em trechos de até 7 palavras distribuídos igualmente pela duração da cena
const Legenda: React.FC<{c: Cena}> = ({c}) => {
	const f = useCurrentFrame();
	if (c.legenda_trechos?.length) {
		const atual = [...c.legenda_trechos].sort((a, b) => b.em - a.em).find((t) => f >= q(t.em));
		return atual ? <Faixa texto={atual.texto}/> : null;
	}
	if (!c.legenda) return null;
	const palavras = c.legenda.split(/\s+/), trechos: string[] = [];
	for (let i = 0; i < palavras.length; i += 7) trechos.push(palavras.slice(i, i + 7).join(' '));
	const i = Math.min(trechos.length - 1, Math.floor((f / q(c.duracao)) * trechos.length));
	return <Faixa texto={trechos[i]}/>;
};

const Faixa: React.FC<{texto: string}> = ({texto}) => (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 64}}>
			<div style={{backgroundColor: 'rgba(5, 10, 18, 0.72)', borderRadius: 14, padding: '14px 30px',
				fontFamily: CORPO, fontWeight: 600, fontSize: 48, color: COR.texto, maxWidth: 1600,
				textAlign: 'center'}}>{texto}</div>
		</AbsoluteFill>
);

const TIPOS = {imagem: CenaImagem, conta: CenaConta, barras: CenaBarras, cartoes: CenaCartoes, fecho: CenaFecho};

export const Aula: React.FC = () => {
	let ini = 0;
	const narracao = (roteiro as any).narracao as string | undefined;
	return (
		<AbsoluteFill style={{backgroundColor: COR.fundo}}>
			{CENAS.map((c, i) => {
				const Tipo = TIPOS[c.tipo];
				const el = (
					<Sequence key={i} from={ini} durationInFrames={q(c.duracao)}>
						<Tipo c={c}/>
						<Legenda c={c}/>
					</Sequence>
				);
				ini += q(c.duracao);
				return el;
			})}
			{narracao && <Audio src={staticFile(narracao)}/>}
		</AbsoluteFill>
	);
};
