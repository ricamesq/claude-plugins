import React from 'react';
import {Composition} from 'remotion';
import {Aula, duracaoTotal, FPS} from './Aula';

export const RemotionRoot: React.FC = () => (
	<Composition id="Aula" component={Aula} durationInFrames={duracaoTotal()} fps={FPS} width={1920} height={1080}/>
);
