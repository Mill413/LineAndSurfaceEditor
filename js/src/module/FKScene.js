import * as THREE from 'three'
import {Vector2} from 'three'
import {OrbitControls} from "../../lib/three/examples/jsm/controls/OrbitControls.js";
import {TransformControls} from "../../lib/three/examples/jsm/controls/TransformControls.js";
import GUI from "../../lib/three/examples/jsm/libs/lil-gui.module.min.js"

const GUIParams = {
    backgroundColor: "#cfc9c9",
    camera: {
        x: 919,
        y: 890,
        z: 548
    },
    spotLight: {
        position: {
            x: 400,
            y: 600,
            z: 1759
        },
        color: 0xffffff,
        intensity: 1.5,
        angle: 0.87,
        distance: 7970,
        visible: false
    },
    plane: {
        xoy: {
            color: 0x8c8c8c,
            opacity: 0.5
        },
        xoz: {
            color: 0x8c8c8c,
            opacity: 0.5
        },
        yoz: {
            color: 0x8c8c8c,
            opacity: 0.5
        }
    },
    grid: {
        xoy: {
            centerLine: 0x444444,
            grid: 0x888888,
            opacity: 0.4,
            size: 2000,
            division: 100
        },
        xoz: {
            centerLine: 0x444444,
            grid: 0x888888,
            opacity: 0.4,
            size: 2000,
            division: 10,
            position: {
                x: 0,
                y: -1000,
                z: 1000
            }
        },
        yoz: {
            centerLine: 0x444444,
            grid: 0x888888,
            opacity: 0.4,
            size: 2000,
            division: 10,
            position: {
                x: -1000,
                y: 0,
                z: 1000
            }
        },
    }
}

class FKScene {
    transformControl
    orbitControl
    helperObjects = []
    spotLight
    spotHelper

    onDownPosition = new THREE.Vector2()

    constructor(preRender = () => {
    }) {
        this.render = () => {
            preRender()
            this.renderer.render(this.scene, this.camera)
        }

        this.setScene()
        this.setCamera()
        this.setRender()
    }

    createInterface(update = () => {
    }) {
        this.setLight()

        this.setPlane()

        this.setGridHelper()

        this.setAxes()

        this.setControls(update)

        this.addEventListener(update)

        // this.setGUI()

        document.getElementById("container").appendChild(this.renderer.domElement)
    }

    //region initialScene
    setScene() {
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(GUIParams.backgroundColor)
    }

    setCamera() {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20000)
        this.camera.position.set(GUIParams.camera.x, GUIParams.camera.y, GUIParams.camera.z)
        this.camera.up.set(0, 0, 1)
        this.scene.add(this.camera)
    }

    setRender() {
        this.renderer = new THREE.WebGLRenderer({antialias: true})
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
    }

    setLight() {
        //????????????
        this.scene.add(new THREE.AmbientLight(0xf0f0f0))
        this.spotLight = new THREE.SpotLight(GUIParams.spotLight.color, GUIParams.spotLight.intensity)
        this.spotLight.position.set(GUIParams.spotLight.position.x, GUIParams.spotLight.position.y, GUIParams.spotLight.position.z)
        this.spotLight.angle = GUIParams.spotLight.angle
        this.spotLight.distance = GUIParams.spotLight.distance
        this.spotLight.castShadow = true
        this.spotLight.shadow.camera.near = 200
        this.spotLight.shadow.camera.far = 2000
        this.spotLight.shadow.bias = -0.000222
        this.spotLight.shadow.mapSize.width = 1024
        this.spotLight.shadow.mapSize.height = 1024

        this.scene.add(this.spotLight)

        this.spotHelper = new THREE.SpotLightHelper(this.spotLight)
        this.scene.add(this.spotHelper)
        this.spotHelper.visible = GUIParams.spotLight.visible
    }

    setPlane() {
        //??????????????????
        const planeGeometry = new THREE.PlaneGeometry(2000, 2000)

        const xoyPlane = new THREE.Mesh(planeGeometry, new THREE.MeshLambertMaterial({
            color: GUIParams.plane.xoy.color,
            opacity: GUIParams.plane.xoy.opacity,
            transparent: true
        }))
        xoyPlane.receiveShadow = true
        xoyPlane.position.set(0, 0, 0)

        const xozPlane = new THREE.Mesh(planeGeometry, new THREE.MeshLambertMaterial({
            color: GUIParams.plane.yoz.color,
            opacity: GUIParams.plane.yoz.opacity,
            transparent: true
        }))
        xozPlane.receiveShadow = true
        xozPlane.rotateX(-Math.PI / 2)
        xozPlane.position.set(0, -1000, 1000)

        const yozPlane = new THREE.Mesh(planeGeometry, new THREE.MeshLambertMaterial({
            color: GUIParams.plane.xoz.color,
            opacity: GUIParams.plane.xoz.opacity,
            transparent: true
        }))
        yozPlane.receiveShadow = true
        yozPlane.rotateY(Math.PI / 2)
        yozPlane.position.set(-1000, 0, 1000)

        this.planes = [xoyPlane, xozPlane, yozPlane]

        this.scene.add(xoyPlane)
        this.scene.add(xozPlane)
        this.scene.add(yozPlane)
    }

    setGridHelper() {
        //?????????????????????
        const xoyGrid = new THREE.GridHelper(2000, 100)
        xoyGrid.rotateX(-Math.PI / 2)
        xoyGrid.material.opacity = 0.4
        xoyGrid.material.transparent = true
        xoyGrid.position.z = -0.5

        const xozGrid = new THREE.GridHelper(2000, 10)
        xozGrid.material.opacity = 0.4
        xozGrid.material.transparent = true
        xozGrid.position.y = -1000
        xozGrid.position.z = 1000

        const yozGrid = new THREE.GridHelper(2000, 10)
        yozGrid.material.opacity = 0.4
        yozGrid.material.transparent = true
        yozGrid.position.x = -1000
        yozGrid.position.z = 1000
        yozGrid.rotateZ(Math.PI / 2)

        this.grids = [xoyGrid, xozGrid, yozGrid]

        this.scene.add(xoyGrid)
        this.scene.add(xozGrid)
        this.scene.add(yozGrid)
    }

    setAxes() {
        //???????????????
        const axesHelper = new THREE.AxesHelper(1000)
        this.add(axesHelper)

        let length = 500

        let oriX = new THREE.Vector3(length, 0, 0)
        let arrowHelperX = new THREE.ArrowHelper(oriX, oriX, length, 0xff0000, 50, 50)
        let spriteX = makeTextSprite("x???",
            {
                fontsize: 100
            })
        spriteX.center = new THREE.Vector2(0, 0)
        spriteX.position.set(length * 2, 0, 0)
        this.add(arrowHelperX)
        this.add(spriteX)

        let oriY = new THREE.Vector3(0, length, 0)
        let arrowHelperY = new THREE.ArrowHelper(oriY, oriY, length, 0x00ff00, 50, 50)
        let spriteY = makeTextSprite("y???",
            {
                fontsize: 100
            })
        spriteY.center = new THREE.Vector2(0, 0)
        spriteY.position.set(0, length * 2, 0)
        this.add(arrowHelperY)
        this.add(spriteY)

        let oriZ = new THREE.Vector3(0, 0, length)
        let arrowHelperZ = new THREE.ArrowHelper(oriZ, oriZ, length, 0x0000ff, 50, 50)
        let spriteZ = makeTextSprite("z???",
            {
                fontsize: 100
            })
        spriteZ.center = new THREE.Vector2(0, 0)
        spriteZ.position.set(0, 20, length * 2)
        this.add(arrowHelperZ)
        this.add(spriteZ)
    }

    setControls(update) {
        //??????OrbitControls
        this.orbitControl = new OrbitControls(this.camera, this.renderer.domElement)
        this.orbitControl.addEventListener('change', this.render)
        // this.orbitControl.minDistance = 500
        // this.orbitControl.maxDistance = 2000

        //??????TransformControls
        this.transformControl = new TransformControls(this.camera, this.renderer.domElement)
        this.transformControl.addEventListener('change', this.render)
        this.transformControl.addEventListener('dragging-changed', event => {
            this.orbitControl.enabled = !event.value
        })
        this.transformControl.addEventListener('objectChange', () => {
            update()
        })
        this.scene.add(this.transformControl)
    }

    setGUI() {
        const gui = new GUI()
        gui.domElement.classList.add("globalGUI")
        gui.title("????????????")

        gui.addColor(GUIParams, "backgroundColor").name("????????????").onChange(color => {
            this.scene.background = new THREE.Color(color)
            this.render()
        })

        //region plane
        let planeFolder = gui.addFolder("??????")

        let xoyFolder = planeFolder.addFolder("xoy???")
        xoyFolder.addColor(GUIParams.plane.xoy, "color").name("??????").onChange(color => {
            this.planes[0].material.color.copy(new THREE.Color(color))
            this.render()
        })
        xoyFolder.add(GUIParams.plane.xoy, "opacity", 0, 1, 0.01).name("????????????").onChange(op => {
            this.planes[0].material.opacity = op
            this.render()
        })

        let xozFolder = planeFolder.addFolder("xoz???")
        xozFolder.addColor(GUIParams.plane.xoz, "color").name("??????").onChange(color => {
            this.planes[1].material.color.copy(new THREE.Color(color))
            this.render()
        })
        xozFolder.add(GUIParams.plane.xoz, "opacity", 0, 1, 0.01).name("????????????").onChange(op => {
            this.planes[1].material.opacity = op
            this.render()
        })

        let yozFolder = planeFolder.addFolder("yoz???")
        yozFolder.addColor(GUIParams.plane.yoz, "color").name("yoz?????????").onChange(color => {
            this.planes[2].material.color.copy(new THREE.Color(color))
            this.render()
        })
        yozFolder.add(GUIParams.plane.yoz, "opacity", 0, 1, 0.01).name("yoz???????????????").onChange(op => {
            this.planes[2].material.opacity = op
            this.render()
        })

        planeFolder.close()
        //endregion

        //region light
        let lightFolder = gui.addFolder("??????")

        let lightPosition = lightFolder.addFolder("????????????")
        lightPosition.add(GUIParams.spotLight.position, "x", -2000, 2000, 1).onChange(() => {
            this.spotLight.position.set(GUIParams.spotLight.position.x, GUIParams.spotLight.position.y, GUIParams.spotLight.position.z)
            this.spotHelper.update()
            this.render()
        })
        lightPosition.add(GUIParams.spotLight.position, "y", -2000, 2000, 1).onChange(() => {
            this.spotLight.position.set(GUIParams.spotLight.position.x, GUIParams.spotLight.position.y, GUIParams.spotLight.position.z)
            this.spotHelper.update()
            this.render()
        })
        lightPosition.add(GUIParams.spotLight.position, "z", 0, 3000, 1).onChange(() => {
            this.spotLight.position.set(GUIParams.spotLight.position.x, GUIParams.spotLight.position.y, GUIParams.spotLight.position.z)
            this.spotHelper.update()
            this.render()
        })

        lightFolder.addColor(GUIParams.spotLight, "color").name("????????????").onChange(color => {
            this.spotLight.color = new THREE.Color(color)
            this.spotHelper.color = new THREE.Color(color)
            this.spotHelper.update()
            this.render()
        })
        lightFolder.add(GUIParams.spotLight, "intensity", 0, 5, 0.1).name("????????????").onChange(int => {
            this.spotLight.intensity = int
            this.spotHelper.update()
            this.render()
        })
        lightFolder.add(GUIParams.spotLight, "angle", 0, Math.PI / 2, 0.01).name("????????????").onChange(() => {
            this.spotLight.angle = GUIParams.spotLight.angle
            this.spotHelper.update()
            this.render()
        })
        lightFolder.add(GUIParams.spotLight, "distance", 0, 10000, 10).name("????????????").onChange(() => {
            this.spotLight.distance = GUIParams.spotLight.distance
            this.spotHelper.update()
            this.render()
        })
        lightFolder.add(GUIParams.spotLight, "visible").name("????????????").onChange(() => {
            this.spotHelper.visible = GUIParams.spotLight.visible
            this.render()
        })

        lightFolder.close()
        //endregion

        //region grid
        let xoyGrid = xoyFolder.addFolder("??????")
        xoyGrid.addColor(GUIParams.grid.xoy, "centerLine").name("????????????").onChange(() => {
            const xoyGrid = new THREE.GridHelper(GUIParams.grid.xoy.size, GUIParams.grid.xoy.division, GUIParams.grid.xoy.centerLine, GUIParams.grid.xoy.grid)
            xoyGrid.rotateX(-Math.PI / 2)
            xoyGrid.material.opacity = GUIParams.grid.xoy.opacity
            xoyGrid.material.transparent = true
            xoyGrid.position.z = -0.5

            this.remove(this.grids[0])
            this.grids[0] = xoyGrid
            this.add(xoyGrid)
            this.render()
        })
        xoyGrid.addColor(GUIParams.grid.xoy, "grid").name("???????????????").onChange(() => {
            const xoyGrid = new THREE.GridHelper(GUIParams.grid.xoy.size, GUIParams.grid.xoy.division, GUIParams.grid.xoy.centerLine, GUIParams.grid.xoy.grid)
            xoyGrid.rotateX(-Math.PI / 2)
            xoyGrid.material.opacity = GUIParams.grid.xoy.opacity
            xoyGrid.material.transparent = true
            xoyGrid.position.z = -0.5

            this.remove(this.grids[0])
            this.grids[0] = xoyGrid
            this.add(xoyGrid)
            this.render()
        })
        xoyGrid.add(GUIParams.grid.xoy, "opacity", 0, 1, 0.01).name("????????????").onChange(() => {
            const xoyGrid = new THREE.GridHelper(GUIParams.grid.xoy.size, GUIParams.grid.xoy.division, GUIParams.grid.xoy.centerLine, GUIParams.grid.xoy.grid)
            xoyGrid.rotateX(-Math.PI / 2)
            xoyGrid.material.opacity = GUIParams.grid.xoy.opacity
            xoyGrid.material.transparent = true
            xoyGrid.position.z = -0.5

            this.remove(this.grids[0])
            this.grids[0] = xoyGrid
            this.add(xoyGrid)
            this.render()
        })
        xoyGrid.add(GUIParams.grid.xoy, "size", 0, 20000, 10).name("??????").onChange((size) => {
            const xoyGrid = new THREE.GridHelper(GUIParams.grid.xoy.size, GUIParams.grid.xoy.division, GUIParams.grid.xoy.centerLine, GUIParams.grid.xoy.grid)
            xoyGrid.rotateX(-Math.PI / 2)
            xoyGrid.material.opacity = GUIParams.grid.xoy.opacity
            xoyGrid.material.transparent = true
            xoyGrid.position.z = -0.5

            this.remove(this.grids[0])
            this.grids[0] = xoyGrid
            this.add(xoyGrid)

            this.planes[0].geometry = new THREE.PlaneGeometry(size, size)
            this.render()
        })
        xoyGrid.add(GUIParams.grid.xoy, "division", 0, GUIParams.grid.xoy.size, 1).name("????????????").onChange(() => {
            const xoyGrid = new THREE.GridHelper(GUIParams.grid.xoy.size, GUIParams.grid.xoy.division, GUIParams.grid.xoy.centerLine, GUIParams.grid.xoy.grid)
            xoyGrid.rotateX(-Math.PI / 2)
            xoyGrid.material.opacity = GUIParams.grid.xoy.opacity
            xoyGrid.material.transparent = true
            xoyGrid.position.z = -0.5

            this.remove(this.grids[0])
            this.grids[0] = xoyGrid
            this.add(xoyGrid)
            this.render()
        })
        xoyGrid.close()

        let xozGrid = xozFolder.addFolder("??????")
        xozGrid.addColor(GUIParams.grid.xoz, "centerLine").name("????????????").onChange(() => {
            const xozGrid = new THREE.GridHelper(GUIParams.grid.xoz.size, GUIParams.grid.xoz.division, GUIParams.grid.xoz.centerLine, GUIParams.grid.xoz.grid)
            xozGrid.material.opacity = GUIParams.grid.xoz.opacity
            xozGrid.material.transparent = true
            xozGrid.position.y = GUIParams.grid.xoz.position.y
            xozGrid.position.z = GUIParams.grid.xoz.position.z

            this.remove(this.grids[1])
            this.grids[1] = xozGrid
            this.add(xozGrid)
            this.render()
        })
        xozGrid.addColor(GUIParams.grid.xoz, "grid").name("???????????????").onChange(() => {
            const xozGrid = new THREE.GridHelper(GUIParams.grid.xoz.size, GUIParams.grid.xoz.division, GUIParams.grid.xoz.centerLine, GUIParams.grid.xoz.grid)
            xozGrid.material.opacity = GUIParams.grid.xoz.opacity
            xozGrid.material.transparent = true
            xozGrid.position.y = GUIParams.grid.xoz.position.y
            xozGrid.position.z = GUIParams.grid.xoz.position.z

            this.remove(this.grids[1])
            this.grids[1] = xozGrid
            this.add(xozGrid)
            this.render()
        })
        xozGrid.add(GUIParams.grid.xoz, "opacity", 0, 1, 0.01).name("????????????").onChange(() => {
            const xozGrid = new THREE.GridHelper(GUIParams.grid.xoz.size, GUIParams.grid.xoz.division, GUIParams.grid.xoz.centerLine, GUIParams.grid.xoz.grid)
            xozGrid.material.opacity = GUIParams.grid.xoz.opacity
            xozGrid.material.transparent = true
            xozGrid.position.y = GUIParams.grid.xoz.position.y
            xozGrid.position.z = GUIParams.grid.xoz.position.z

            this.remove(this.grids[1])
            this.grids[1] = xozGrid
            this.add(xozGrid)
            this.render()
        })
        xozGrid.add(GUIParams.grid.xoz, "size", 0, 20000, 10).name("??????").onChange((size) => {
            const xozGrid = new THREE.GridHelper(GUIParams.grid.xoz.size, GUIParams.grid.xoz.division, GUIParams.grid.xoz.centerLine, GUIParams.grid.xoz.grid)
            xozGrid.material.opacity = GUIParams.grid.xoz.opacity
            xozGrid.material.transparent = true
            xozGrid.position.y = GUIParams.grid.xoz.position.y
            xozGrid.position.z = GUIParams.grid.xoz.position.z

            this.remove(this.grids[1])
            this.grids[1] = xozGrid
            this.add(xozGrid)

            this.planes[1].geometry = new THREE.PlaneGeometry(size, size)
            this.render()
        })
        xozGrid.add(GUIParams.grid.xoz, "division", 0, GUIParams.grid.xoz.size, 1).name("????????????").onChange(() => {
            const xozGrid = new THREE.GridHelper(GUIParams.grid.xoz.size, GUIParams.grid.xoz.division, GUIParams.grid.xoz.centerLine, GUIParams.grid.xoz.grid)
            xozGrid.material.opacity = GUIParams.grid.xoz.opacity
            xozGrid.material.transparent = true
            xozGrid.position.y = GUIParams.grid.xoz.position.y
            xozGrid.position.z = GUIParams.grid.xoz.position.z

            this.remove(this.grids[1])
            this.grids[1] = xozGrid
            this.add(xozGrid)
            this.render()
        })
        xozGrid.add(GUIParams.grid.xoz.position, "y", -10000, 0, 1).onChange(y => {
            this.grids[1].position.y = y
            this.render()
        })
        xozGrid.add(GUIParams.grid.xoz.position, "z", 0, 10000, 1).onChange(z => {
            this.grids[1].position.z = z
            this.render()
        })
        xozGrid.close()

        let yozGrid = yozFolder.addFolder("??????")
        yozGrid.addColor(GUIParams.grid.yoz, "centerLine").name("????????????").onChange(() => {
            const yozGrid = new THREE.GridHelper(GUIParams.grid.yoz.size, GUIParams.grid.yoz.division, GUIParams.grid.yoz.centerLine, GUIParams.grid.yoz.grid)
            yozGrid.material.opacity = GUIParams.grid.yoz.opacity
            yozGrid.material.transparent = true
            yozGrid.position.x = -1000
            yozGrid.position.z = 1000
            yozGrid.rotateZ(Math.PI / 2)

            this.remove(this.grids[2])
            this.grids[2] = yozGrid
            this.add(yozGrid)
            this.render()
        })
        yozGrid.addColor(GUIParams.grid.yoz, "grid").name("???????????????").onChange(() => {
            const yozGrid = new THREE.GridHelper(GUIParams.grid.yoz.size, GUIParams.grid.yoz.division, GUIParams.grid.yoz.centerLine, GUIParams.grid.yoz.grid)
            yozGrid.material.opacity = GUIParams.grid.yoz.opacity
            yozGrid.material.transparent = true
            yozGrid.position.x = -1000
            yozGrid.position.z = 1000
            yozGrid.rotateZ(Math.PI / 2)

            this.remove(this.grids[2])
            this.grids[2] = yozGrid
            this.add(yozGrid)
            this.render()
        })
        yozGrid.add(GUIParams.grid.yoz, "opacity", 0, 1, 0.01).name("????????????").onChange(() => {
            const yozGrid = new THREE.GridHelper(GUIParams.grid.yoz.size, GUIParams.grid.yoz.division, GUIParams.grid.yoz.centerLine, GUIParams.grid.yoz.grid)
            yozGrid.material.opacity = GUIParams.grid.yoz.opacity
            yozGrid.material.transparent = true
            yozGrid.position.x = -1000
            yozGrid.position.z = 1000
            yozGrid.rotateZ(Math.PI / 2)

            this.remove(this.grids[2])
            this.grids[2] = yozGrid
            this.add(yozGrid)
            this.render()
        })
        yozGrid.add(GUIParams.grid.yoz, "size", 0, 20000, 10).name("??????").onChange((size) => {
            const yozGrid = new THREE.GridHelper(GUIParams.grid.yoz.size, GUIParams.grid.yoz.division, GUIParams.grid.yoz.centerLine, GUIParams.grid.yoz.grid)
            yozGrid.material.opacity = GUIParams.grid.yoz.opacity
            yozGrid.material.transparent = true
            yozGrid.position.x = -1000
            yozGrid.position.z = 1000
            yozGrid.rotateZ(Math.PI / 2)

            this.remove(this.grids[2])
            this.grids[2] = yozGrid
            this.add(yozGrid)

            this.planes[2].geometry = new THREE.PlaneGeometry(size, size)
            this.render()
        })
        yozGrid.add(GUIParams.grid.yoz, "division", 0, GUIParams.grid.xoy.size, 1).name("????????????").onChange(() => {
            const yozGrid = new THREE.GridHelper(GUIParams.grid.yoz.size, GUIParams.grid.yoz.division, GUIParams.grid.yoz.centerLine, GUIParams.grid.yoz.grid)
            yozGrid.material.opacity = GUIParams.grid.yoz.opacity
            yozGrid.material.transparent = true
            yozGrid.position.x = -1000
            yozGrid.position.z = 1000
            yozGrid.rotateZ(Math.PI / 2)

            this.remove(this.grids[2])
            this.grids[2] = yozGrid
            this.add(yozGrid)
            this.render()
        })
        yozGrid.add(GUIParams.grid.yoz.position, "x", -10000, 0, 1).onChange(x => {
            this.grids[2].position.x = x
            this.render()
        })
        yozGrid.add(GUIParams.grid.yoz.position, "z", 0, 10000, 1).onChange(z => {
            this.grids[2].position.z = z
            this.render()
        })
        yozGrid.close()
        //endregion

        gui.close()
    }

    //endregion

    //region Event
    addEventListener() {
        document.addEventListener('pointerdown', e => this.onPointerDown(e))
        document.addEventListener('pointerup', e => this.onPointerUp(e))
        document.addEventListener('pointermove', e => this.onPointerMove(e))

        window.addEventListener('resize', () => this.onWindowResize())
    }

    onPointerUp(event) {
        const onUpPosition = new THREE.Vector2()
        onUpPosition.x = event.clientX
        onUpPosition.y = event.clientY
        if (this.onDownPosition.distanceTo(onUpPosition) === 0)
            this.transformControl.detach()
        this.render()
    }

    onPointerDown(event) {
        this.onDownPosition.x = event.clientX
        this.onDownPosition.y = event.clientY
    }

    onPointerMove(event) {
        const mousePointer = new THREE.Vector2()
        mousePointer.x = (event.clientX / window.innerWidth) * 2 - 1
        mousePointer.y = -(event.clientY / window.innerHeight) * 2 + 1
        const rayCaster = new THREE.Raycaster()
        rayCaster.setFromCamera(mousePointer, this.camera)
        const intersects = rayCaster.intersectObjects(this.helperObjects, false)
        if (intersects.length > 0) {
            const object = intersects[0].object
            if (object !== this.transformControl.object && this.transformControl.object == null) {
                this.transformControl.attach(object)
            }
        }

    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.render()
    }
    //endregion

    addControlHelper(position) {
        const material = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff})
        const objectGeometry = new THREE.OctahedronGeometry(20)
        const object = new THREE.Mesh(objectGeometry, material)

        if (position) {
            object.position.copy(position)
        } else {
            object.position.x = Math.random() * 1000 - 500
            object.position.y = Math.random() * 600
            object.position.z = Math.random() * 800 - 400
        }

        object.castShadow = true
        object.receiveShadow = true
        this.scene.add(object)
        this.helperObjects.push(object)

        return object
    }

    add(obj) {
        this.scene.add(obj)
    }

    remove(obj) {
        this.scene.remove(obj)
    }
}

/* ?????????????????? */
function makeTextSprite(message, parameters) {
    function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
    }

    //region parameters
    if (parameters === undefined) parameters = {}

    let fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial"

    /* ???????????? */
    let fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18

    /* ???????????? */
    let borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 0

    /* ???????????? */
    let borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : {r: 255, g: 255, b: 255, a: 0}

    /* ???????????? */
    let backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : {r: 255, g: 255, b: 255, a: 0}
    //endregion

    let canvas = document.createElement('canvas')
    //region context
    /* ???????????? */
    let context = canvas.getContext('2d')

    /* ???????????? */
    context.font = "Bold " + fontsize + "px " + fontface

    /* ???????????????????????????????????????????????????????????? */
    let metrics = context.measureText(message)
    let textWidth = metrics.width

    /* ???????????? */
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")"

    /* ??????????????? */
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")"
    context.lineWidth = borderThickness

    /* ?????????????????? */
    roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6)

    /* ???????????? */
    context.fillStyle = "rgba(0, 0, 0, 1.0)"
    context.fillText(message, borderThickness, fontsize + borderThickness)
    //endregion

    /* ?????????????????????????????? */
    let texture = new THREE.Texture(canvas)
    texture.needsUpdate = true

    let spriteMaterial = new THREE.SpriteMaterial({map: texture})
    let sprite = new THREE.Sprite(spriteMaterial)

    /* ???????????? */
    sprite.scale.set(100, 50, 10)

    sprite.center = new Vector2(0, 0)

    return sprite

}

export {FKScene, makeTextSprite}



