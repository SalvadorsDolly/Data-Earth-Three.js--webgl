var status = document.getElementById("status");

var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    mouseX = 0,
    mouseY = 0,
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,
    camera, scene, renderer, data, title, date, amount;

    var textureLoader = new THREE.TextureLoader();

    var composer, shaderTime = 0,
    badTVParams, badTVPass, rgbPass, filmPass, renderPass, copyPass, loaded = 0,
    toLoad = 2,
    group;


// function to map values to ranges and detect loaded assets

function map( n, start1, stop1, start2, stop2 ) {
    return (( n-start1 ) / ( stop1-start1 )) * ( stop2-start2 ) + start2;
}

function loader() {
    loaded++;
    if (loaded >= toLoad) {
        // remove preload screen.
        var cover = document.getElementById( "preloader" );
        cover.style.visibility = 'hidden';
        animate();
    }
}

// Initialize 3D Scene- Three.JS, Renderer and Shaders

function init() {
    status.innerHTML = "Loaded Images";

    var container, particles, particle;
    container = document.createElement('div');
    document.body.appendChild( 'container' );

    camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH/SCREEN_HEIGHT, 1, 10000 );
    camera.position.y = 100;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.004 );

    renderer = new THREE.WebGLRenderer( {antialias:true} );
    renderer.setClearColor( 0x030f0f );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    container.appendChild(renderer.domElement);

    //create shaders

    renderPass = new THREE.RenderPass( scene, camera );
    badTVPass = new THREE.ShaderPass( THREE.BadTVShader );
    rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
    filmPass = new THREE.ShaderPass( THREE.FilmShader );
    copyPass + new THREE.ShaderPass( THREE.CopyShader );
    filmPass.uniforms.grayscale.value = 0;

    // effect composer now adds each shader as a separate pass. 

    composer = new THREE.EffectComposer( renderer );
    composer.addPass( renderPass );
    composer.addPass( filmPass );
    composer.addPass( badTVPass );
    composer.addPass( rgbPass );
    composer.addPass( copyPass );
    copyPass.renderToScreen = true;

    //create lights load earth texture around sphere.

    params();
    group = new THREE.Group();
    scene.add( group );
    var light = new THREE.SpotLight( 0x99ffff, 1, 0, Math.PI, 1 );
    var planetTexture = textureLoader.load('img/earth_map.png', function(tex) {
        loader();
    });

    // creating mesh for 3D earth, size, opacity etc.

    var geometry = new THREE.SphereBufferGeometry( 100, 350, 350 );
    var material = new THREE.MeshBasicMaterial( {map: planetTexture,
                       transparent: true,
                       opacity: 0.99,
                       side: THREE.DoubleSide,
                       blending: THREE.AdditiveBlending
    });
    var earth = new THREE.Mesh(geometry, material);
    group.add(earth);
    material = new THREE.MeshBasicMaterial({
                   map: planetTexture, transparent: true,
                   opacity: 0.95, side: THREE.DoubleSide,
                   blending: THREE.AdditiveBlending
    });

    earth = new THREE.Mesh( geometry, material);
    earth.scale.x = earth.scale.y = earth.scale.z = 1.02;
    group.add( earth );

    // create an icosahedron mesh here

    var mesh = new THREE.Object3D();
    mesh.add(new THREE.LineSegments(
        new THREE.IcosahedronBufferGeometry(110, 1),
        new THREE.LineBasicMaterial({
                    color: 0x156289,
                    transparent: true,
                    opacity: 0.55
                })

        ));
    group.add( mesh );
    geometry = new THREE.Geometry();
    sprite = textureLoader.load( "img/sprite.png", function(tex) {
        loader();
    });

    // create stars via particles

    for ( i = 0; i < 2000; i++ ) {
        var vertex = new THREE.Vector3();
        vertex.x = 400 * Math.random() - 200;
        vertex.y = 400 * Math.random() - 200;
        vertex.z = 400 * Math.random() - 200;
        geometry.vertices.push(vertex); 
    }
    material = new THREE.PointsMaterial({
                    size: 2,
                    map: sprite,
                    transparent: true,
                    opacity: 0.5,
                    alphaTest: 0.5

    });
    particles1 = new THREE.Points( geometry, material );
    particles.sortParticles = true;
    group.add( particles1 );
    for (var i = 0; i < data.features.length; i++) {

        var geometry = new THREE.Geometry();
        var lat = data.features[i].geometry.coordinates[1];
        var lon = data.features[i].geometry.coordinates[0];
        var mag = data.features[i].properties.mag;

        var radius = 100;
        if ( mag > 0 ) {
            var nmag = map(mag, 0, 8, 0, 1);
             //console.log(mag);
            var phi = (90 - lat) * (Math.PI / 180);
            var theta = (lon + 180) * (Math.PI / 180);
            var x = -((radius) * Math.sin(phi) * Math.cos(theta));
            var z = ((radius) * Math.sin(phi) * Math.sin(theta));
            var y = ((radius) * Math.cos(phi));
            var vertex = new THREE.Vector3(x, y, z);
            geometry.vertices.push(vertex);

            var vertex2 = vertex.clone();
            vertex2.multiplyScaler((nmag * 0.4) +1 );
            geometry.vertices.push( vertex2 );
            var myCol = new THREE.Color(0xffffff);
            myCol.setHSL((mag / 5), 0.9, 0.6);
            var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
                        color: myCol,
                        linewidth: 1
            }));
            group.add(line);
            }
        }
        

    


}

