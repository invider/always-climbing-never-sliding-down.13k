const dfSMCP = {
    name:      'mover',
    speed:     20,
}

class FPSMovementControllerPod {

    constructor(st) {
        extend(this, dfSMCP, st)

        this.pushers = new Float32Array(SHIFT_ROLL+1)
    }

    init() {
        lab.broker = this

        document.onpointerlockchange = (e) => {
            if (document.pointerLockElement) {
                env.mouseLock = true
            } else {
                env.mouseLock = false
            }
        }
    }

    push(action, factor, dt) {
        const __ = this.__
        const speed     = this.speed

        switch(action) {
            case FORWARD:
                __.moveZ(-speed * dt)
                break
            case STRAFE_LEFT:
                __.moveX(-speed * dt)
                break
            case BACKWARD:
                __.moveZ(speed * dt)
                break
            case STRAFE_RIGHT:
                __.moveX(speed * dt)
                break

            case LOOK_LEFT:
                __.yaw(-tune.turnSpeed * dt)
                break
            case LOOK_RIGHT:
                __.yaw(tune.turnSpeed * dt)
                break

            case LOOK_UP:
                __.tilt(-tune.tiltSpeed * dt)
                break
            case LOOK_DOWN:
                __.tilt(tune.tiltSpeed * dt)
                break
            case SHIFT_YAW:
                __.yaw(tune.turnMouseSpeed * factor * dt)
                break
            case SHIFT_PITCH:
                __.tilt(-tune.tiltMouseSpeed * factor * dt)
                break
        }
    }

    evo(dt) {
        // activate pushers
        for (let i = 0; i < this.pushers.length; i++) {
            const f = this.pushers[i]
            if (f) {
                this.push(i, f, dt)
                if (i > 20) this.pushers[i] = 0 // reset the mouse movement accumulation buffers
            }
        }
    }

    activate(action) {
        this.pushers[action] = 1

        if (action === JUMP && this.__.pos[1] - this.__.hh === 0) {
            this.__.momentum[1] += tune.jumpSpeed
        }
    }

    stop(action) {
        this.pushers[action] = 0
    }

    onMouseDown(e) {
        if (e.button == 0) {
            if (!env.mouseLock) this.capture()
        }
    }

    onMouseUp(e) {
    }

    onMouseMove(e) {
        if (!env.mouseLock) return

        const dx = e.movementX, dy = e.movementY
        if (dx) {
            if (e.shiftKey) {
                // accumulate mouse roll
                this.pushers[SHIFT_ROLL] += dx
            } else {
                // accumulate horizontal mouse movement
                this.pushers[SHIFT_YAW] += dx
            }
        }
        if (dy) {
            // accumulate vertical mouse movement
            this.pushers[SHIFT_PITCH] += dy
        }
    }

    capture() {
        gcanvas.requestPointerLock()
    }
}
