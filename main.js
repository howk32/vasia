/*
 * RetroArch menu shader pipeline ribbon
 * port for THREE.js
 * optimized for wallpaper engine
 * https://github.com/libretro/RetroArch
 * https://github.com/mrdoob/three.js
 * https://store.steampowered.com/app/431960/
 */

window.wallpaperPropertyListener = {
	applyGeneralProperties: function(properties) {
		if (properties.fps) { //apply fps from settings
			once.fps = null;
			
			config.fpsCache[1] = properties.fps;
			
			animInit();
		}
		fpsRefresh();
	},
	
	applyUserProperties: function(properties) {
		if (properties.stub && once.user === undefined) { //prestub
			preInit();
		}
		
		//fpsSettings
		if (properties.framerate) { //0 = native, 1 = settings, 2 = custom
			config.fpsMode = properties.framerate.value;
		}
		
		if (properties.fps) { //[0; 60] int (default = 30)
			config.fpsCache[2] = properties.fps.value;
		}
		
		fpsRefresh();
		//
		
		//backgroundSettings
		if (properties.usepreset) { //
			config.usePreset = properties.usepreset.value ? 1 : 0;
		}
		
		if (properties.interpolation) { //
			config.interpolation = properties.interpolation.value;
		}
		
		if (properties.rotation) { //[0; 360] int (default = 0)
			config.rotation = properties.rotation.value;
		}
		
		if (properties.blend) { //
			let temp = properties.blend.value.split(' ');
			for(let i = 0; i < temp.length; i++) {
				config.blend[i] = parseFloat(temp[i]) * 255;
			}
		}
		
		if (properties.preset) { //[1; 20] int (default = 11)
			parseColorInt(1, 0, colorPresets[properties.preset.value - 1][0]);
			parseColorInt(1, 1, colorPresets[properties.preset.value - 1][1]);
			parseColorInt(1, 2, colorPresets[properties.preset.value - 1][2]);
			parseColorInt(1, 3, colorPresets[properties.preset.value - 1][3]);
		}
		
		if (properties.color1) { //color1 (BL)
			parseColorFloat(0, 0, properties.color1.value.split(' '));
		}
		if (properties.color2) { //color2 (BR)
			parseColorFloat(0, 1, properties.color2.value.split(' '));
		}
		if (properties.color3) { //color3 (TL)
			parseColorFloat(0, 2, properties.color3.value.split(' '));
		}
		if (properties.color4) { //color4 (TR)
			parseColorFloat(0, 3, properties.color4.value.split(' '));
		}

		if(!config.interpolation){
			//interpolation = false
			//2 color gradient
			container.style.backgroundImage = null;
			container.style.background = `
				linear-gradient(
					${config.rotation}deg,
				rgba(
					${color[config.usePreset][0][0]},
					${color[config.usePreset][0][1]},
					${color[config.usePreset][0][2]},
					${color[config.usePreset][0][3]}
				),rgba(
					${color[config.usePreset][3][0]},
					${color[config.usePreset][3][1]},
					${color[config.usePreset][3][2]},
					${color[config.usePreset][3][3]}
				))
			`;
			//0 = DOWN
			//3 = UP
		} else {
			//interpolation = true
			//dirty way of interpolating 4 colors
			container.style.background = `
				rgb(
					${config.blend[0]},
					${config.blend[1]},
					${config.blend[2]}
				)
			`;
			container.style.backgroundImage = `
				url("data:image/svg+xml;utf8,%3Csvg preserveAspectRatio='none' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop offset='0' stop-color='%23ffffff' stop-opacity='0'%3E%3C/stop%3E%3Cstop offset='1' stop-color='%23ffffff' stop-opacity='1'%3E%3C/stop%3E%3C/linearGradient%3E%3Cmask id='m'%3E%3Crect x='0' y='0' width='1' height='1' fill='url(%23g)'%3E%3C/rect%3E%3C/mask%3E%3ClinearGradient id='a' gradientTransform='rotate(90)'%3E%3Cstop offset='0' stop-color='%23${
					componentToHex(color[config.usePreset][3][0]) +
					componentToHex(color[config.usePreset][3][1]) +
					componentToHex(color[config.usePreset][3][2])
				}'%3E%3C/stop%3E%3Cstop offset='1' stop-color='%23${
					componentToHex(color[config.usePreset][1][0]) +
					componentToHex(color[config.usePreset][1][1]) +
					componentToHex(color[config.usePreset][1][2])
				}'%3E%3C/stop%3E%3C/linearGradient%3E%3ClinearGradient id='b' gradientTransform='rotate(90)'%3E%3Cstop offset='0' stop-color='%23${
					componentToHex(color[config.usePreset][0][0]) +
					componentToHex(color[config.usePreset][0][1]) +
					componentToHex(color[config.usePreset][0][2])
				}'%3E%3C/stop%3E%3Cstop offset='1' stop-color='%23${
					componentToHex(color[config.usePreset][2][0]) +
					componentToHex(color[config.usePreset][2][1]) +
					componentToHex(color[config.usePreset][2][2])
				}'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='0' y='0' width='1' height='1' fill='url(%23a)' mask='url(%23m)'%3E%3C/rect%3E%3Crect x='0' y='0' width='1' height='1' fill='url(%23b)' mask='url(%23m)' transform='translate(1,1) rotate(180)'%3E%3C/rect%3E%3C/svg%3E")
			`;
			//0 = BL
			//1 = BR
			//2 = TL
			//3 = TR
		}
		//
		
		//shaderSettings
		if (properties.widthsegments || properties.heightsegments) { //[0; 512] int (default = 128)
			if (properties.widthsegments) {config.widthSegments = properties.widthsegments.value;}
			if (properties.heightsegments) {config.heightSegments = properties.heightsegments.value;}
			
			if(once.cleanup !== undefined){ //dispose of geometry if already existent on refresh
				scene.remove( mesh );
				geometry.dispose();
				material.dispose(); //does for some reason not appear to be necessary to free up memory, or it does not work as intended
			}
			once.cleanup = null;
			
			geometry = new THREE.PlaneGeometry(1, 1, config.widthSegments, config.heightSegments);
			mesh = new THREE.Mesh(geometry, material);

			scene.add(mesh);
			resize();
		}
		
		if (properties.speed) { //[-0.1; 0.1] float4 (default = 0.01)
			config.speed = properties.speed.value;
		}
		
		if (properties.scale) { //[0; 1.5] float3 (default = 0.75)
			config.scale = properties.scale.value
			resize();
		}
		
		if (properties.ribboncolor) { //
			let temp = properties.ribboncolor.value.split(' ');
			material.uniforms.ribboncolor.value.setRGB(temp[0], temp[1], temp[2]);
		}
		//
		
		//materialSettings
		setUniform(properties, "alpha"); //[0; 25.5] float2 (default = 1)
		setUniform(properties, "vertical_offset"); //[-2; 2] float4 (default = 0)
		setUniform(properties, "amplitude"); //[0; 5] float3 (default = 1)
		setUniform(properties, "period"); //[0; 5] float3 (default = 1)
		setUniform(properties, "frequency"); //[0; 10] float2 (default = 1)
		setUniform(properties, "sub_amplitude"); //[0; 10] float2 (default = 1)
		setUniform(properties, "sub_period"); //[0; 10] float2 (default = 1)
		setUniform(properties, "sub_frequency1"); //[0; 5] float2 (default = 1)
		setUniform(properties, "sub_frequency2"); //[0; 5] float2 (default = 1)
		setUniform(properties, "sub_frequency3"); //[0; 25] float2 (default = 1)
		setUniform(properties, "sub_frequency4"); //[0; 25] float2 (default = 1)
		setUniform(properties, "stretch"); //[0; 5] float3 (default = 1)
		setUniform(properties, "colorshift"); //[0; 10] float3 (default = 1)
		setUniform(properties, "randomnoise"); //[0; 2] float4 (default = 1)
		//
		
		if (properties.stub && once.user === undefined) { //poststub
			once.user = null;
			
			postInit();
		} //dirty way of running code when wallpaper engine sucessfuly loaded everything on startup
	}
};

const config = {
	usePreset: 0, //0 = custom, 1 = preset
	interpolation: null, //true for 4 color interpolation, false for 2 color linear gradient
	rotation: null, //rotation for linear gradient betweeon 0 and 360
	blend: [  0,   0,   0, 255], //color adjustment value for dirty interpolation
	
	fps: null, //defined framerate
	fpsMode: 0, //0 = native, 1 = settings, 2 = custom
	fpsCache: [-1, null, null], //[0 = native, 1 = settings, 2 = custom] framerate values
	
	speed: null, //animation speed
	frameDelta: null, //compensate lower framerate, intended for 60hz monitors
	scale: null, //scaling factor
	
	widthSegments: null,
	heightSegments: null,
}

const once = {
	initialized: undefined, //null once initialized
	fps: undefined, //null once fps settings applied
	user: undefined, //null once user properties applied
	cleanup: undefined, //null once scene created to initiate cleanup for next scene change
}

const color = [ //[0 = custom, 1 = preset] [0 = red, 1 = green, 2 = blue, 3 = alpha]
	[ //custom
		[  0,   0,   0, 255], //color1 (BL)
		[  0,   0,   0, 255], //color2 (BR)
		[  0,   0,   0, 255], //color3 (TL)
		[  0,   0,   0, 255], //color4 (TR)
	],
	[ //preset
		[  0,   0,   0, 255], //color1 (BL)
		[  0,   0,   0, 255], //color2 (BR)
		[  0,   0,   0, 255], //color3 (TL)
		[  0,   0,   0, 255], //color4 (TR)
	],
]


const container = document.querySelector('#container');
const canvas = document.querySelector('#canvas');

const material = new THREE.ShaderMaterial({
	uniforms: {
		time: {value: 0.0},
		
		ribboncolor: {value: new THREE.Color(0.0, 0.0, 0.0)},
		alpha: {value: 0.0},
		vertical_offset: {value: 0.0},
		amplitude: {value: 0.0},
		period: {value: 0.0},
		frequency: {value: 0.0},
		sub_amplitude: {value: 0.0},
		sub_period: {value: 0.0},
		sub_frequency1: {value: 0.0},
		sub_frequency2: {value: 0.0},
		sub_frequency3: {value: 0.0},
		sub_frequency4: {value: 0.0},
		stretch: {value: 0.0},
		colorshift: {value: 0.0},
		randomnoise: {value: 0.0},
	},
	vertexShader: `
		uniform float time;
		
		uniform float vertical_offset;
		uniform float amplitude;
		uniform float period;
		uniform float frequency;
		uniform float sub_amplitude;
		uniform float sub_period;
		uniform float sub_frequency1;
		uniform float sub_frequency2;
		uniform float sub_frequency3;
		uniform float sub_frequency4;
		uniform float stretch;
		uniform float colorshift;
		uniform float randomnoise;
		
		varying vec3 fragVertexEc;
		
		float iqhash(float n) {
			return fract(sin(n) * 43758.5453 * randomnoise);
		}
		
		float noise(vec3 x) {
				vec3 p = floor(x);
				vec3 f = fract(x);
				f = f * f * (3.0 - 2.0 * f);
				float n = p.x + p.y * 57.0 + 113.0 * p.z;
				return mix(mix(mix(iqhash(n), iqhash(n + 1.0), f.x),
					mix(iqhash(n + 57.0), iqhash(n + 58.0), f.x), f.y),
					mix(mix(iqhash(n + 113.0), iqhash(n + 114.0), f.x),
					mix(iqhash(n + 170.0), iqhash(n + 171.0), f.x), f.y), f.z);
		}
		
		float xmb_noise2(vec3 x) {
			return cos(x.z * 4.0) * cos(x.z + time / 10.0 * sub_frequency4 + x.x);
		}
		
		void main() {
			vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			vec3 v = vec3(pos.x, 0.0, pos.y);
			vec3 v2 = v;
			vec3 v3 = v;
			
			v.y = xmb_noise2(v2) / 8.0 * stretch;
			
			v3.x += time / 5.0 * sub_frequency1;
			v3.x /= 4.0 / sub_period;
			
			v3.z += (time / 10.0) * sub_frequency2;
			v3.y += (time / 100.0) * sub_frequency3;
			
			v.z += noise(v3 * 7.0) / 15.0 * colorshift;
			v.y += (noise(v3 * 7.0) / 15.0 * sub_amplitude + cos(period * v.x * 2.0 - time / 2.0 * frequency) / 5.0 - 0.3) * amplitude + vertical_offset;
			
			fragVertexEc = v;
			gl_Position = vec4(v, 1.0);
		}
	`,
	fragmentShader: `
		uniform float time;
		
		uniform vec3 ribboncolor;
		uniform float alpha;
		
		varying vec3 fragVertexEc;
		
		void main()
		{
			const vec3 up = vec3(0.0, 0.0, 1.0);
			vec3 x = dFdx(fragVertexEc);
			vec3 y = dFdy(fragVertexEc);
			vec3 normal = normalize(cross(x, y));
			float c = 1.0 - dot(normal, up);
			c = (1.0 - cos(c * c)) / 3.0;
			gl_FragColor = vec4(ribboncolor, c * alpha);
		}
	`,
	extensions: {
		derivatives: true,
		fragDepth: false,
		drawBuffers: false,
		shaderTextureLOD: false
	},
	side: THREE.DoubleSide,
	transparent: true,
	depthTest: false,
});

const colorPresets = [ //[properties.preset.value - 1]
	[ //0  black
		[  0,   0,   0, 255],
		[  0,   0,   0, 255],
		[  0,   0,   0, 255],
		[  0,   0,   0, 255],
	],
	[ //1  white
		[255, 255, 255, 255],
		[255, 255, 255, 255],
		[255, 255, 255, 255],
		[255, 255, 255, 255],
	],
	[ //2  gradient_dark_purple
		[ 20,  13,  20, 255],
		[ 20,  13,  20, 255],
		[ 92,  44,  92, 255],
		[148,  90, 148, 255],
	],
	[ //3  gradient_midnight_blue
		[ 44,  62,  80, 255],
		[ 44,  62,  80, 255],
		[ 44,  62,  80, 255],
		[ 44,  62,  80, 255],
	],
	[ //4  gradient_golden
		[174, 123,  44, 255],
		[205, 174,  84, 255],
		[ 58,  43,  24, 255],
		[ 58,  43,  24, 255],
	],
	[ //5  gradient_legacy_red
		[171,  70,  59, 255],
		[171,  70,  59, 255],
		[190,  80,  69, 255],
		[190,  80,  69, 255],
	],
	[ //6  gradient_electric_blue
		[  1,   2,  67, 255],
		[  1,  73, 183, 255],
		[  1,  93, 194, 255],
		[  3, 162, 254, 255],
	],
	[ //7  gradient_apple_green
		[102, 134,  58, 255],
		[122, 131,  52, 255],
		[ 82, 101,  35, 255],
		[ 63,  95,  30, 255],
	],
	[ //8  gradient_undersea
		[ 23,  18,  41, 255],
		[ 30,  72, 114, 255],
		[ 52,  88, 110, 255],
		[ 69, 125, 140, 255],
	],
	[ //9  gradient_volcanic_red
		[255,   0,  26, 255],		//[1.0 * 255, 0.0 * 255, 0.1 * 255, 255],
		[255,  26,   0, 255],		//[1.0 * 255, 0.1 * 255, 0.0 * 255, 255],
		[ 26,   0,  26, 255],		//[0.1 * 255, 0.0 * 255, 0.1 * 255, 255],
		[ 26,   0,  26, 255],		//[0.1 * 255, 0.0 * 255, 0.1 * 255, 255],
	],
	[ //10 gradient_dark
		[ 26,  26,  26, 255],		//[0.1 * 255, 0.1 * 255, 0.1 * 255, 255],
		[ 26,  26,  26, 255],		//[0.1 * 255, 0.1 * 255, 0.1 * 255, 255],
		[  0,   0,   0, 255],		//[0.0 * 255, 0.0 * 255, 0.0 * 255, 255],
		[  0,   0,   0, 255],		//[0.0 * 255, 0.0 * 255, 0.0 * 255, 255],
	],
	[ //11 gradient_morning_blue
		[221, 241, 254, 255],		//[221, 241, 254, 255],
		[135, 206, 250, 255],		//[135, 206, 250, 255],
		[255, 255, 255, 255],		//[1.0 * 255, 1.0 * 255, 1.0 * 255, 255],
		[170, 200, 252, 255],		//[170, 200, 252, 255],
	],
	[ //12 gradient_sunbeam
		[ 20,  13,  20, 255],		//[ 20,  13,  20, 255],
		[ 30,  72, 114, 255],		//[ 30,  72, 114, 255],
		[255, 255, 255, 255],		//[1.0 * 255, 1.0 * 255, 1.0 * 255, 255],
		[ 26,   0,  26, 255],		//[0.1 * 255, 0.0 * 255, 0.1 * 255, 255],
	],
	[ //13 gradient_lime_green
		[209, 255,  82, 255],
		[146, 232,  66, 255],
		[ 82, 101,  35, 255],
		[ 63,  95,  30, 255],
	],
	[ //14 gradient_pikachu_yellow
		[ 63,  63,   1, 255],
		[174, 174,   1, 255],
		[191, 194,   1, 255],
		[254, 221,   3, 255],
	],
	[ //15 gradient_gamecube_purple
		[ 40,  20,  91, 255],
		[160, 140, 211, 255],
		[107,  92, 177, 255],
		[ 84,  71, 132, 255],
	],
	[ //16 gradient_famicom_red
		[255, 191, 171, 255],
		[119,  49,  28, 255],
		[148,  10,  36, 255],
		[206, 126, 110, 255],
	],
	[ //17 gradient_flaming_hot
		[231,  53,  53, 255],
		[242, 138,  97, 255],
		[236,  97,  76, 255],
		[255, 125,   3, 255],
	],
	[ //18 gradient_ice_cold
		[ 66, 183, 229, 255],
		[ 29, 164, 255, 255],
		[176, 255, 247, 255],
		[174, 240, 255, 255],
	],
	[ //19 gradient_midgar
		[255,   0,   0, 255],
		[  0,   0, 255, 255],
		[  0, 255,   0, 255],
		[ 32,  32,  32, 255],
	],
];

let camera, scene, renderer;
let geometry, mesh;

function componentToHex(c) { //convert color to hex
	let hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function setUniform(property, key) { //set uniforms via key name
	if(property[key]) {
		material.uniforms[key].value = property[key].value;
	}
}

function parseColorInt(p, n, buffer) { //p = custom/preset, n = rgba index, buffer = colorarray
	for(let i = 0; i < buffer.length; i++) {
		color[p][n][i] = buffer[i];
	}
}

function parseColorFloat(p, n, buffer) { //p = custom/preset, n = rgba index, buffer = colorarray
	for(let i = 0; i < buffer.length; i++) {
		color[p][n][i] = parseFloat(buffer[i]) * 255;
	}
}

function fpsRefresh() { //recalculate framerate adjustments on property change
	config.fps = config.fpsCache[config.fpsMode];
	if(config.fpsMode == 0 || config.fps <= 0) {
		config.frameDelta = 1;
	} else {
		config.frameDelta = 60 / config.fps;
	}
}

function resize() { //resize scene on property change
	const {offsetWidth, offsetHeight} = container;

	renderer.setSize(offsetWidth, offsetHeight);
	renderer.setPixelRatio(devicePixelRatio);

	camera.aspect = offsetWidth / offsetHeight;
	camera.updateProjectionMatrix();

	mesh.scale.set(camera.aspect * 1.55, config.scale, 1);
}

function preInit() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	camera.position.z = 2;
	renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: canvas});
}

function postInit() {
	window.addEventListener('resize', resize);
	
	animInit();
}

function animInit() { //run once only if config fully initialized
	if(once.fps !== undefined && once.user !== undefined && once.initialized === undefined){
		once.initialized = null;
		requestAnimationFrame(animate);
	}
}

function animate() {
	setTimeout (function() {
		requestAnimationFrame(animate);
	}, 1000 / config.fps);
	
	render();
}

function render() {
	renderer.render(scene, camera);
	material.uniforms.time.value += config.speed * config.frameDelta;
}
