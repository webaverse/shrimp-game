import * as THREE from 'three';

import metaversefile from 'metaversefile';

const { useApp, useFrame, useInternals, useLocalPlayer, useLoaders, usePhysics, useCleanup, useActivate, useNpcManager } = metaversefile;
const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector4 = new THREE.Vector3();
const localVector5 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();
const localQuaternion3 = new THREE.Quaternion();
const localQuaternion4 = new THREE.Quaternion();


export default () => {
  const app = useApp();
  const { renderer, camera } = useInternals();
  const localPlayer = useLocalPlayer();
  const physics = usePhysics();
  const textureLoader = new THREE.TextureLoader();
  const npcManager = useNpcManager();
  
  //####################################################### load bridge glb ####################################################
  {    
    let velocity = new THREE.Vector3();
    let angularVel = new THREE.Vector3();
    let physicsIds = [];
    let defaultSpawn = new THREE.Vector3(-194, -9, 1.78);
    let headObj = null;
    let signalObj = null;
    let degrees = 180;
    let timeSincePassive = 0;
    let timeSinceActive = 0;
    let timeSinceChangedTarget = 0;
    let hide = true;
    let goalX = 70;
    let startX = -160;
    let minWait = 3500;
    let maxWait = 10000;
    let rotationSpeed = 2;
    let goColor = 0x2eb800;
    let stopColor = 0xc90000;
    let eyeArray = [];
    let laserArray = [];
    let activeLines = [];
    let mainDoor = null;
    let mainSpawn = null;
    let spawnGame1 = null;
    let bridgeSpawn = null;
    let bridgeEnd = null;
    let gameState = 0;
    let glassArray = [];
    let bridgeFallLimit = -529;

    let audioArray = [];
    let greenAudio = null;
    let redAudio = null;
    let scanAudio = null;
    let shotAudio = null;
    let robotAudio = null;
    let positiveAudio = null;

    (async () => {
        const u = `${baseUrl}/red-green/bridge-section/assets/stange.glb`; // must prefix "/bride-game" when working locally
        let gltf = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);
            
        });
        gltf.scene.position.set(gltf.scene.position.x, -500, gltf.scene.position.z);

            const geometry = new THREE.BoxGeometry( 2, 0.05, 2 );
            const material = new THREE.MeshLambertMaterial( { color: 0x09102b, opacity: 0.5, transparent: true} );
            const mesh = new THREE.Mesh( geometry, material );
            const mesh2 = new THREE.Mesh( geometry, material );

            for (var i = 0; i < 18; i++) {
              let maxTracks = 5;
              let minTracks = 1;
              let randomSfx = Math.floor(Math.random() * (maxTracks - minTracks + 1)) + minTracks;
              let temp = mesh.clone();
               temp.position.set(-20 + i*3.7, (-500 -1.7), -6.46);
               app.add( temp );
               glassArray.push(temp);
               temp.updateMatrixWorld();
               const physicsId = physics.addGeometry(temp);
               physicsIds.push(physicsId);
               temp.physicsId = physicsId;
               physicsId.glassObj = temp;

               let temp2 = mesh2.clone();
               temp2.position.set(-20 + i*3.7, (-500 -1.7), -3.46);
               app.add( temp2 );
               glassArray.push(temp2);
               temp2.updateMatrixWorld();
               const physicsId2 = physics.addGeometry(temp2);
               physicsIds.push(physicsId2);
               temp2.physicsId = physicsId2;
               physicsId2.glassObj = temp2;

               if (Math.random() > 0.5) {
                if(Math.random() > 0.5) {
                  temp.breakable = true 
                }
                else {
                  temp2.breakable = true
                }
              }

               const listener = new THREE.AudioListener();
               camera.add( listener );

               const sound = new THREE.PositionalAudio( listener );
               const audioLoader = new THREE.AudioLoader();
                audioLoader.load( 'https://webaverse.github.io/bridge-section/audio/glass' + randomSfx.toString() + '.wav', function( buffer ) {
                      sound.setBuffer( buffer );
                      sound.setRefDistance( 10 );
                      sound.setVolume( 100 );
                });
                        
               if(temp.breakable) {
                  temp.add( sound );
                  temp.audio = sound;
               }
               else {
                  temp2.add( sound );
                  temp2.audio = sound;
               }

            }
        app.add(gltf.scene);
        app.updateMatrixWorld();
    })();
    (async () => {
        const u = `${baseUrl}/red-green/assets/wassiefirst.glb`; // must prefix "/bride-game" when working locally
        let gltf = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);        
        });
        app.add(gltf.scene);

        app.traverse(o => {
                  if(o.name === "head") {
                    headObj = o;
                  }
                  if(o.name === "signal") {
                    signalObj = o;
                  }
                  if(o.name === "eyeL") {
                    eyeArray[0] = o;
                  }
                  if(o.name === "eyeR") {
                    eyeArray[1] = o;
                  }
                  if(o.name === "mainDoor") {
                    mainDoor = o;
                  }
                  if(o.name === "mainSpawn") {
                    mainSpawn = o;
                  }
                  if(o.name === "spawnGame1") {
                    spawnGame1 = o;
                  }
                  if(o.name === "bridgeSpawn") {
                    bridgeSpawn = o;
                  }
                  if(o.name === "bridgeEnd") {
                    bridgeEnd = o;
                  }
                  o.castShadow = true;
                });

        const physicsId = physics.addGeometry(gltf.scene);
        physicsIds.push(physicsId);
        app.updateMatrixWorld();

        const listener = new THREE.AudioListener();
         camera.add( listener );

        greenAudio = new THREE.Audio( listener );
        redAudio = new THREE.Audio( listener );
        scanAudio = new THREE.Audio( listener );
        shotAudio = new THREE.Audio( listener );
        robotAudio = new THREE.Audio( listener );
        positiveAudio = new THREE.Audio(listener);

        audioArray.push(greenAudio, redAudio, scanAudio, shotAudio, robotAudio);

         const audioLoader = new THREE.AudioLoader();
         audioLoader.load( 'scenes/red-green/audio/Robot_Head2.wav', function( buffer ) {
                robotAudio.setBuffer( buffer );
                robotAudio.setVolume( 0.07 );
          });
          audioLoader.load( 'scenes/red-green/audio/Green.wav', function( buffer ) {
                greenAudio.setBuffer( buffer );
                greenAudio.setVolume( 2 );
          });
          audioLoader.load( 'scenes/red-green/audio/Scanning.wav', function( buffer ) {
                scanAudio.setBuffer( buffer );
                scanAudio.setVolume( 0.2 );
          });
          audioLoader.load( 'scenes/red-green/audio/Alarm.wav', function( buffer ) {
                redAudio.setBuffer( buffer );
                redAudio.setVolume( 0.5 );
          });
          audioLoader.load( 'scenes/red-green/audio/shot.ogg', function( buffer ) {
                shotAudio.setBuffer( buffer );
                shotAudio.setVolume( 1 );
          });
          audioLoader.load( 'scenes/red-green/audio/positive.wav', function( buffer ) {
                positiveAudio.setBuffer( buffer );
                positiveAudio.setVolume( 1 );
          });
    })();
    useCleanup(() => {
      for (const physicsId of physicsIds) {
        physics.removeGeometry(physicsId);
      }
    });

    const _stopAllAudio = () => {
      for (var i = 0; i < audioArray.length; i++) {
        if(audioArray[i].isPlaying) {
          audioArray[i].stop();
        }
      }

    }

    const _checkCharacterIsMoving = (timestamp) => {
      if(localPlayer.characterPhysics.velocity.length().toFixed(2) > 1 && localPlayer.position.x < goalX) {
        timeSincePassive = timestamp;
        hide = true;
        signalObj.material.emissive = new THREE.Color(goColor);
        _changeGameState(0, 1500);
        if(shotAudio && !shotAudio.isPlaying) {
          shotAudio.play();
        }
        //physics.setCharacterControllerPosition(localPlayer.characterController, mainSpawn.position);
      }

      /*for (var i = 0; i < npcManager.npcs.length; i++) {
        if(npcManager.npcs[i].characterPhysics.velocity.length().toFixed(2) > 1 && npcManager.npcs[i].position.x < goalX) {
          //physics.setCharacterControllerPosition(npcManager.npcs[i].characterController, defaultSpawn);
          let npcPlayer = npcManager.npcs[i];
           if (!npcPlayer.hasAction('stop')) {
              const newAction = {
                type: 'stop'
              };
              npcPlayer.addAction(newAction);
              
              setTimeout(() => {
                npcPlayer.removeAction('stop');
              }, 1000);
            }

        }
      }*/
    }

    const _createLine = (targetPos) => { 
      if(activeLines.length <= 2) {
          for (var i = 0; i < eyeArray.length; i++) {
          var dir = new THREE.Vector3(); // create once an reuse it
          let tempObj = eyeArray[i].clone();
          let worldPos = new THREE.Vector3();
          tempObj.localToWorld(worldPos);
          dir.subVectors( targetPos, worldPos );
          
          var pointA = worldPos.clone();

          var distance = worldPos.distanceTo(targetPos); // at what distance to determine pointB

          var pointB = new THREE.Vector3();
          pointB.addVectors ( pointA, dir.normalize().multiplyScalar( distance ) );

          let points = [];
          points.push(pointA);
          points.push(pointB);
          const geometry = new THREE.BufferGeometry().setFromPoints( points );
          var material = new THREE.LineBasicMaterial( { color : 0xff0000, linewidth: 2 } );
          var line = new THREE.Line( geometry, material );
          app.add( line );
          activeLines.push(line);
        }
      } else {
        _clearLines();
      }
    }

    const _clearLines = () => {
        for (var i = 0; i < activeLines.length; i++) {
          app.remove(activeLines[i]);
        }
        activeLines.length = 0;
    }

    const _changeGameState = (state, delay) => {
      if(state === 0) {
        _stopAllAudio();
        localPlayer.avatar.app.visible = false;
        setTimeout(() => {
          localPlayer.avatar.app.visible = true;
          physics.setCharacterControllerPosition(localPlayer.characterController, mainSpawn.position);
        }, delay);
      }
      if(state === 1) {
        physics.setCharacterControllerPosition(localPlayer.characterController, spawnGame1.position);
      }
      if(state === 3) {
        physics.setCharacterControllerPosition(localPlayer.characterController, mainSpawn.position);
      }
      if(state === 4) {
        physics.setCharacterControllerPosition(localPlayer.characterController, bridgeSpawn.position);
      }
      if(state === 5) {
        physics.setCharacterControllerPosition(localPlayer.characterController, mainSpawn.position);
      }

      if(state !== 0 && state !== 2) {
        if(positiveAudio  && !positiveAudio.isPlaying) {
          positiveAudio.play();
        }
      }
      
      setTimeout(() => {
        gameState = state;
      }, delay);
    }


    useFrame(({ timeDiff, timestamp }) => {

      if(localPlayer.avatar) {

        if (localPlayer.hasAction('narutoRun') ){
            localPlayer.removeAction('narutoRun');
            // this doesn't affect speed unfortunately, we need ways to completely disable actions in some scenes.       
        }

        if (localPlayer.hasAction('fly') ){
            //localPlayer.removeAction('fly');
            // works but has stutter when pressed       
        }

        if(gameState === 0) {
          var distance = localPlayer.position.distanceTo(mainDoor.position);
          if (distance < 1) {
            _changeGameState(1, 500);
          }
        }

        if(gameState === 1) {
          if(localPlayer.position.x > startX) {
            _changeGameState(2, 500);
          }
        }

                
        if(gameState === 2) {
          degrees = THREE.MathUtils.clamp(degrees, 0, 180);

          if(localPlayer.position.x > goalX) {
            _changeGameState(3, 0);
          }

          if(degrees === 0) {
            if((timestamp - timeSinceChangedTarget) > 500) {
             /* for (var i = 0; i < npcManager.npcs.length; i++) {
                _createLine(npcManager.npcs[i].position);
                timeSinceChangedTarget = timestamp;
            }*/
            if(scanAudio && !scanAudio.isPlaying) {
              scanAudio.play();
            }
            _createLine(localPlayer.position);
                timeSinceChangedTarget = timestamp;

            }
            if((timestamp - timeSinceActive) > 5000) {
              timeSincePassive = timestamp;
              hide = true;
              signalObj.material.emissive = new THREE.Color(goColor);
              if(greenAudio  && !greenAudio.isPlaying) {
                greenAudio.play();
              }
              if(scanAudio && scanAudio.isPlaying) {
                scanAudio.stop();
              }
              if(robotAudio && !robotAudio.isPlaying) {
                robotAudio.play();
              }

              /*for (var i = 0; i < npcManager.npcs.length; i++) {
                let npcPlayer = npcManager.npcs[i];
                 if (!npcPlayer.hasAction('go')) {
                    const newAction = {
                      type: 'go'
                    };
                    npcPlayer.addAction(newAction);
                    
                    setTimeout(() => {
                      npcPlayer.removeAction('go');
                    }, 1000);
                  }

              }*/
            }
            _checkCharacterIsMoving(timestamp);
          }

          //console.log(localPlayer.characterPhysics.velocity.length());




          if(degrees === 180) {
            if((timestamp - timeSincePassive) > Math.floor(Math.random() * maxWait) + minWait) {
              timeSinceActive = timestamp;
              hide = false;
              signalObj.material.emissive = new THREE.Color(stopColor);
              if(redAudio  && !redAudio.isPlaying) {
                redAudio.play();
              }
              if(robotAudio && !robotAudio.isPlaying) {
                robotAudio.play();
              }
            }
          }

          if(hide) {
            degrees+=rotationSpeed;
            _clearLines();
          }
          else {
            degrees-=rotationSpeed;
          }

          headObj.rotation.y = THREE.MathUtils.degToRad(degrees);
          headObj.updateMatrixWorld();
        }

        if(gameState === 3) {
          var distance = localPlayer.position.distanceTo(mainDoor.position);
          if (distance < 1) {
            _changeGameState(4, 500);
          }
        }

        if(gameState === 4) {
          if(localPlayer.position.y <= bridgeFallLimit) {
            _changeGameState(0, 500);
          }
          var distance = localPlayer.position.distanceTo(bridgeEnd.position);
          if (distance < 1) {
            _changeGameState(5, 500);
          }
          const downQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.5);
          const resultDown = physics.raycast(localPlayer.position, downQuat);
          if(resultDown && localPlayer.characterPhysics.lastGroundedTime === timestamp) {
            let foundObj = metaversefile.getPhysicsObjectByPhysicsId(resultDown.objectId);
            if(foundObj) {
              if(foundObj.glassObj) {
                if(foundObj.glassObj.breakable) {
                  if(foundObj.glassObj.audio) {
                    foundObj.glassObj.audio.play();
                    foundObj.glassObj.visible = false;
                    physics.disableGeometry(foundObj);
                    physics.disableGeometryQueries(foundObj);
                  }

                  // Ensures falling and not being able to sprint/run to the next glass plate
                  physics.setCharacterControllerPosition(localPlayer.characterController, new THREE.Vector3(localPlayer.position.x, localPlayer.position.y - 1, localPlayer.position.z));
                }
              }
            }

          }
        }
        
      }

      // Resets character position to spawn position
      if(localPlayer.position.y < -25 || localPlayer.characterPhysics.velocity.length() > 25) {
        //physics.setCharacterControllerPosition(localPlayer.characterController, defaultSpawn);
      }

      
    });
  }

  return app;
};

