/* ГБПОУ КК УСПК — неоновый 3D-глобус (Three.js r128, прозрачный фон) */
/* global THREE */
(function () {
    'use strict';
    var TEXT = 'ГБПОУ КК УСПК';
    var BLUE = '#087CFF', CYAN = '#00D9FF';
    var MASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//7//wAAAAAAAAAAAAAAAAAAAAAAB///////AA/wDwAAHgAAAAAAAAAAAHf//////4AB/gAAAAD+AAAAAAAAAAD/v/8////4AA/gAA+ADf4AGAAAAAAAH///4A///4AAAAAH4Af/8AP8AAAAAAH///+Af//wAAAAAeD////+H4AAwH/gf////4P//wAAD8AeH///////wRw//////9/4P//AAAP/nP//////////+///////3/H/wuAAf//////////////////////+H/B/AB//////////////Df/////7/8D8A8AP//////////////A//////gf8B4AAAP/////////////8A/8////wP+AAAAGP5///////////fQAHwB///8H/AAAAPD//////////8B8AAeAB////v/wAAAfD//////////9B8AAAAB//////4AAAfv///////////B4AAAAAf/////4AAAX////////////AwAAAAAf/////8AAAH////////////gAAAAAAH/////8AAAH////////////AAAAAAAH/////gAAAB//7////////7gAAAAAAH////8AAAAf//7ff//////3gAAAAAAH////wAAAAfy/////////+HAAAAAAAD///+AAAAAfi///v/////+GAAAAAAAD///+AAAAAf/7////////+OAAAAAAAB///+AAAAAP/Rz///////n+AAAAAAAA///4EAAAAf/zB///////jwAAAAAAAAf//wAAAAAf//////////hAAAAAAAAAP/9wAAAAB///////////wAAAAAAAAAP/A8AAAAD///////////gAAAAAAAAAH/AcAAAAD///////////gAAAAACAAAD/B8AAAAH//////H///+gAAAAADgAAAfPeAAAAH//////B///wgAAAAABgAAAf+P8AAAH////v+A/j/wwAAAAAAAAAAP+EsAAAH/////+A/B/hwAAAAAAAAAABfgAAAAH/////4A+B/hwAAAAAAAAAAAPgwAAAH/////wAeAfg4AAAAAAAAAAADj/AAAH/////wAcAXh4AAAAAAAAAAAB//gAAD/////wAOAbDcAAAAAAAAAAAAf/4AAB/////gAOAcC8AAAAAAAAAAAAH/+AAAfv///gACB8HIAAAAAAAAAAAAP/+AAAAD///AAAA8/EAAAAAAAAAAAAf//AAAAD//+AAAAe/+AAAAAAAAAAAAf//wAAAD//8AAAAO/38AAAAAAAAAAAf//+AAAD//4AAAAPf//mAAAAAAAAAAf///gAAB//wAAAAHHw/vAAAAAAAAAAf///gAAA//wAAAAD8AX9wAAAAAAAAAP///gAAA//wAAAAAf8PcYAAAAAAAAAP///AAAA//4AAAAAA57cMAAAAAAAAAH///AAAA//5wAAAAAH7AAAAAAAAAAAH//+AAAB//7wAAAAAP7gBAgAAAAAAAB//+AAAB///wAAAAAf/wBDAAAAAAAAA//+AAAB//jgAAAAB//4ADAAAAAAAAA//8AAAA//HgAAAAH//4DAAAAAAAAAA//8AAAAf/HAAAAAP//8BAAAAAAAAAA//gAAAAf/HAAAAAP//+AAAAAAAAAAA//AAAAAf+AAAAAAP//+AAAAAAAAAAA//AAAAAPmAAAAAAH//+AAAAAAAAAAA/+AAAAAPkAAAAAAH//+AAAAAAAAAAA/8AAAAAP4AAAAAAH8/+AAAAAAAAAAB/8AAAAAGAAAAAAAHQf8AMAAAAAAAAB/wAAAAAAAAAAAAAAAH8APAAAAAAAAB/wAAAAAAAAAAAAAAADwAPAAAAAAAAD+AAAAAAAAAAAAAAAAA4AeAAAAAAAAD+AAAAAAAAAAAAAAAAA4A4AAAAAAAAD8AAAAAAAAAAAAAAAAAABwAAAAAAAAD8AAAAAAAAAAAAAAAAAABgAAAAAAAAD8AAAAAAAAAADAAAAAAAAAAAAAAAAADxwAAAAAAAAAAAAAAAAAAAAAAAAAAAD5gAAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAOAAAGIAQAAAAAAAAAAAAOAAAAAAAAD/+D/////wAAAAAAAAAAA+AAAAAEsH//+///////wAAAAAAAPAD/AAAA///////////////wAAAAPkP///AAAH///////////////wAAD///////AAAf///////////////AAD///////wAgf///////////////+AAP//////+BD4/////////////////AAB////////v/////////////////4ABAf//////////////////////////g//////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'; // 180x90 бит суши (шаг 2°), base64


    var land = (function () {
        var b = atob(MASK), bits = new Uint8Array(180 * 90);
        for (var i = 0; i < bits.length; i++) bits[i] = (b.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
        return function (lat, lon) {
            var x = Math.min(179, Math.max(0, Math.floor((lon + 180) / 2)));
            var y = Math.min(89, Math.max(0, Math.floor((90 - lat) / 2)));
            return bits[y * 180 + x] === 1;
        };
    })();

    function fib(n, filter) {
        var out = [], ga = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < n; i++) {
            var y = 1 - (i + 0.5) / n * 2, r = Math.sqrt(1 - y * y), t = ga * i;
            var x = Math.cos(t) * r, z = Math.sin(t) * r;
            var lat = Math.asin(y) * 180 / Math.PI, lon = Math.atan2(-z, x) * 180 / Math.PI;
            if (filter(lat, lon)) out.push(x, y, z);
        }
        return new Float32Array(out);
    }

    function dotsMaterial(color, size, K, pr) {
        return new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            uniforms: { uColor: { value: new THREE.Color(color) }, uSize: { value: size }, uK: { value: K }, uPR: { value: pr } },
            vertexShader: 'uniform float uSize,uK,uPR;varying float vF;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);' +
                'vec3 n=normalize(normalMatrix*position);vF=0.25+0.75*smoothstep(-0.2,0.7,n.z);' +
                'gl_PointSize=max(1.5*uPR,uSize*uK/-mv.z);gl_Position=projectionMatrix*mv;}',
            fragmentShader: 'uniform vec3 uColor;varying float vF;void main(){float d=length(gl_PointCoord-.5);' +
                'float a=smoothstep(.5,.12,d)*vF;gl_FragColor=vec4(uColor*a,a);}'
        });
    }

    function textTexture() {
        var W = 2048, H = 1024, c = document.createElement('canvas');
        c.width = W; c.height = H;
        var g = c.getContext('2d');
        g.font = 'bold 40px Arial, Helvetica, sans-serif';
        g.textBaseline = 'middle'; g.textAlign = 'left';
        var m = g.measureText(TEXT).width, row = 0;
        var lv = ['#ffffff', '#b8b8b8', '#dcdcdc', '#8c8c8c', '#f0f0f0', '#a4a4a4']; // яркость; цвет задаёт шейдер
        for (var lat = -76; lat <= 76; lat += 8, row++) {
            var n = Math.max(2, Math.round(6 * Math.cos(lat * Math.PI / 180)));
            var seg = W / n, y = (90 - lat) / 180 * H, off = (row % 2) * seg / 2;
            var k = seg * 0.97 / m;
            for (var i = 0; i < n; i++) {
                var x = i * seg + off;
                g.fillStyle = lv[(i * 3 + row * 5) % lv.length];
                g.shadowColor = g.fillStyle; g.shadowBlur = 9;
                [0, -W].forEach(function (dx) {
                    g.save(); g.translate(x + dx, y); g.scale(k, 1); g.fillText(TEXT, 0, 0); g.restore();
                });
            }
        }
        var t = new THREE.CanvasTexture(c);
        t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4; return t;
    }

    function landTexture() {
        var s = document.createElement('canvas'); s.width = 180; s.height = 90;
        var sg = s.getContext('2d'), id = sg.createImageData(180, 90);
        for (var y = 0; y < 90; y++) for (var x = 0; x < 180; x++) {
            var p = (y * 180 + x) * 4, v = land(90 - (y + 0.5) * 2, (x + 0.5) * 2 - 180) ? 255 : 0;
            id.data[p] = id.data[p + 1] = id.data[p + 2] = id.data[p + 3] = v;
        }
        sg.putImageData(id, 0, 0);
        var t = new THREE.CanvasTexture(s); t.wrapS = THREE.RepeatWrapping; return t;
    }

    function ribbonTexture() {
        var W = 4096, H = 256, c = document.createElement('canvas');
        c.width = W; c.height = H;
        var g = c.getContext('2d');
        g.fillStyle = 'rgba(8,124,255,0.14)'; g.fillRect(0, 6, W, H - 12);
        g.fillStyle = CYAN; g.fillRect(0, 6, W, 6); g.fillRect(0, H - 12, W, 6);
        var s = TEXT + ' • ', reps = 3; g.font = 'bold 132px Arial, Helvetica, sans-serif';
        g.textBaseline = 'middle'; g.textAlign = 'left';
        var m = g.measureText(s).width, seg = W / reps;
        g.shadowColor = CYAN; g.shadowBlur = 24; g.fillStyle = '#E6FBFF';
        for (var i = 0; i < reps; i++) { g.save(); g.translate(i * seg, H / 2 + 2); g.scale(seg / m, 1); g.fillText(s, 0, 0); g.restore(); }
        var t = new THREE.CanvasTexture(c);
        t.anisotropy = 4; t.premultiplyAlpha = true; return t;
    }

    function Globe(el) {
        var FOV = 30, mobile = matchMedia('(max-width:768px)').matches;
        var pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: 'low-power' });
        renderer.setClearColor(0x000000, 0); renderer.setPixelRatio(pr);
        var cv = renderer.domElement; cv.className = 'uspc-globe-canvas'; el.appendChild(cv);
        var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
        var root = new THREE.Group(), spin = new THREE.Group();
        root.rotation.x = 0.2; root.add(spin); scene.add(root);
        var disposables = [], uniformsK = [];

        var N = mobile ? 0.6 : 1;
        function addDots(arr, color, size) {
            var geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
            var mat = dotsMaterial(color, size, 1, pr);
            uniformsK.push(mat.uniforms.uK);
            spin.add(new THREE.Points(geo, mat)); disposables.push(geo, mat);
        }
        addDots(fib(Math.round(1800 * N), function (a, o) { return !land(a, o); }), BLUE, 0.009);
        addDots(fib(Math.round(16000 * N), function (a, o) { return land(a, o); }), CYAN, 0.024);

        var og = new THREE.SphereGeometry(0.985, 48, 32), om = new THREE.MeshBasicMaterial({ colorWrite: false });
        var occ = new THREE.Mesh(og, om); occ.renderOrder = -1; root.add(occ); disposables.push(og, om); // невидимое «тело» шара: прячет заднюю часть ленты и точек
        var bg = new THREE.SphereGeometry(0.99, 48, 32), bm = new THREE.MeshBasicMaterial({ color: 0x041a52, transparent: true, opacity: 0.7, depthWrite: false });
        root.add(new THREE.Mesh(bg, bm)); disposables.push(bg, bm);
        var tt = textTexture(), tl = landTexture();
        var sm = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            uniforms: { tText: { value: tt }, tLand: { value: tl }, uOff: { value: 0 }, uTime: { value: 0 } },
            vertexShader: 'varying vec2 vUv;varying vec3 vN;void main(){vUv=uv;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
            fragmentShader: 'uniform sampler2D tText,tLand;uniform float uTime;varying vec2 vUv;varying vec3 vN;' +
                'void main(){vec4 t=texture2D(tText,vUv);' +
                'float l=smoothstep(.3,.7,texture2D(tLand,vUv).a);' +
                'float w=.5+.5*sin(uTime*1.4+vUv.x*90.+vUv.y*40.);' +
                'float lit=.55+.8*smoothstep(-.3,.9,dot(vN,normalize(vec3(-.55,.45,.7))));' +
                'vec3 ocean=mix(vec3(.03,.22,.95),vec3(.08,.42,1.),w*.5+.25)*(.38+.55*t.r);' +
                'vec3 lnd=mix(vec3(.25,.95,1.),vec3(.9,1.,1.),w*.6)*(1.1+.5*t.r);' +
                'float sw=pow(.5+.5*sin(vN.x*4.+vN.y*2.-uTime*1.6),10.);vec3 col=mix(ocean,lnd,l)*lit+vec3(.15,.55,.8)*sw*t.a;float f=.3+.7*smoothstep(-.1,.75,vN.z);' +
                'gl_FragColor=vec4(col*(1.+.4*l),t.a*f);}'
        });
        var sg = new THREE.SphereGeometry(1.012, 64, 48);
        spin.add(new THREE.Mesh(sg, sm)); disposables.push(tt, tl, sm, sg);

        var RH = 0.42, RD = 0.12, RT = Math.sqrt(1 - Math.pow(RD + RH / 2, 2)) + 0.04, RB = Math.sqrt(1 - Math.pow(RD - RH / 2, 2)) + 0.04;
        var rt = ribbonTexture(), rg = new THREE.CylinderGeometry(RT, RB, RH, 128, 1, true);
        var rf = new THREE.MeshBasicMaterial({ map: rt, transparent: true, depthWrite: false, side: THREE.FrontSide });
        var rb = new THREE.MeshBasicMaterial({ map: rt, transparent: true, depthWrite: false, side: THREE.BackSide, opacity: 0.35 });
        var mb = new THREE.Mesh(rg, rb), mf = new THREE.Mesh(rg, rf);
        mb.renderOrder = 1; mf.renderOrder = 3;
        var rib = new THREE.Group(), tilt = new THREE.Group();
        rib.add(mf); tilt.add(rib); tilt.rotation.set(0.25, 0, 0.5);
        tilt.position.set(0, 1, 0).applyEuler(tilt.rotation).multiplyScalar(RD); // RD — подъём ленты над экватором
        root.add(tilt); disposables.push(rt, rg, rf, rb);

        var hg = new THREE.SphereGeometry(1.1, 48, 32);
        var hm = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            vertexShader: 'varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
            fragmentShader: 'varying vec3 n;void main(){float f=pow(1.-abs(n.z),2.)*1.3;vec3 c=vec3(.03,.49,1.)*f;gl_FragColor=vec4(c,f*.9);}'
        });
        var halo = new THREE.Mesh(hg, hm); halo.renderOrder = 2; root.add(halo); disposables.push(hg, hm);

        // мини-сферы, парящие вокруг глобуса
        var orb = new THREE.Group(), orbs = [], og2 = new THREE.SphereGeometry(1, 16, 12);
        var cm = [0x5CE6FF, 0x087CFF, 0xE6FBFF, 0x00D9FF].map(function (c) { return new THREE.MeshBasicMaterial({ color: c }); });
        var gc = document.createElement('canvas'); gc.width = gc.height = 64; var gx = gc.getContext('2d'), gg = gx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gg.addColorStop(0, 'rgba(120,230,255,0.9)'); gg.addColorStop(0.3, 'rgba(8,150,255,0.35)'); gg.addColorStop(1, 'rgba(8,124,255,0)');
        gx.fillStyle = gg; gx.fillRect(0, 0, 64, 64);
        var hmat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
        for (var q = 0; q < (mobile ? 10 : 16); q++) {
            var sz = 0.026 + rnd() * 0.04, ang = rnd() * 6.283, rr = 1.2 + rnd() * 0.25, y0 = (rnd() - 0.5) * 1.9;
            var mm = new THREE.Mesh(og2, cm[q % 4]); mm.scale.setScalar(sz);
            var hh = new THREE.Sprite(hmat); hh.scale.setScalar(7); hh.renderOrder = 4; mm.add(hh);
            mm.position.set(Math.cos(ang) * rr * Math.sqrt(1 - y0 * y0 / 5), y0, Math.sin(ang) * rr * Math.sqrt(1 - y0 * y0 / 5));
            orbs.push({ m: mm, y0: y0, ph: rnd() * 6.283, sp: 0.6 + rnd() }); orb.add(mm);
        }
        root.add(orb); disposables.push(og2, hmat, hmat.map); cm.forEach(function (c) { disposables.push(c); });

        function resize() {
            var w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
            renderer.setSize(w, h, false);
            cam.aspect = w / h;
            var d = 1.3 / Math.tan(FOV * Math.PI / 360) / Math.min(1, cam.aspect);
            cam.position.set(0, 0, d); cam.updateProjectionMatrix();
            var K = renderer.domElement.height / (2 * Math.tan(FOV * Math.PI / 360));
            uniformsK.forEach(function (u) { u.value = K; });
        }
        var ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
        if (ro) ro.observe(el); else window.addEventListener('resize', resize);
        resize();

        var base = 0.35, speed = base, target = base, last = performance.now(), raf = 0, visible = true, t0 = last;
        this.setSpeed = function (v) { base = v; };
        function frame(now) {
            raf = requestAnimationFrame(frame);
            if (!visible || document.hidden) { last = now; return; }
            var dt = Math.min(0.05, (now - last) / 1000); last = now;
            target = base * (1 + 0.3 * Math.sin((now - t0) / 1000 * 0.6)); // плавное «дыхание» скорости
            speed += (target - speed) * Math.min(1, dt * 2);
            spin.rotation.y += speed * dt;
            sm.uniforms.uTime.value = (now - t0) / 1000;
            rib.rotation.y -= speed * dt * 1.3;
            orb.rotation.y += dt * 0.14;
            var tt2 = (now - t0) / 1000;
            orbs.forEach(function (o) { o.m.position.y = o.y0 + 0.06 * Math.sin(tt2 * o.sp + o.ph); }); // лента крутится в обратную сторону
            renderer.render(scene, cam);
        }
        var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }) : null;
        if (io) io.observe(el);
        raf = requestAnimationFrame(frame);

        this.destroy = function () {
            cancelAnimationFrame(raf);
            if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
            if (io) io.disconnect();
            disposables.forEach(function (o) { o.dispose(); });
            renderer.dispose(); renderer.forceContextLoss();
            if (cv.parentNode) cv.parentNode.removeChild(cv);
            el.__uspcGlobe = null;
        };
        el.__uspcGlobe = this;
    }

    function init() {
        if (!window.THREE) return console.error('USPC Globe: Three.js не загружен');
        document.querySelectorAll('.uspc-globe-container').forEach(function (el) {
            if (!el.__uspcGlobe) new Globe(el);
        });
    }
    window.UspcGlobe = { init: init };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
