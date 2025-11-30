import { useEffect, useRef } from 'react'
import { WeatherEffect } from '../utils/weatherEffects'

interface WeatherEffectProps {
  effect: WeatherEffect
}

export function WeatherEffectComponent({ effect }: WeatherEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (effect === 'none' || !canvasRef.current) {
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particle class
    class Particle {
      x: number = 0
      y: number = 0
      speed: number = 0
      size: number = 0
      opacity: number = 0
      angle: number = 0
      rotation: number = 0
      rotationSpeed: number = 0

      constructor() {
        this.reset()
      }

      reset() {
        if (effect === 'snow') {
          this.x = Math.random() * canvas.width
          this.y = -10
          this.speed = Math.random() * 2 + 1
          this.size = Math.random() * 4 + 2
          this.opacity = Math.random() * 0.5 + 0.5
          this.angle = Math.random() * Math.PI * 2
          this.rotation = Math.random() * Math.PI * 2
          this.rotationSpeed = (Math.random() - 0.5) * 0.1
        } else if (effect === 'rain') {
          this.x = Math.random() * canvas.width
          this.y = -10
          this.speed = Math.random() * 5 + 3
          this.size = Math.random() * 2 + 1
          this.opacity = Math.random() * 0.3 + 0.3
          this.angle = Math.PI / 4 // 45 degrees
          this.rotation = 0
          this.rotationSpeed = 0
        } else if (effect === 'leaves') {
          this.x = Math.random() * canvas.width
          this.y = -10
          this.speed = Math.random() * 1 + 0.5
          this.size = Math.random() * 8 + 4
          this.opacity = Math.random() * 0.4 + 0.4
          this.angle = Math.random() * Math.PI * 2
          this.rotation = Math.random() * Math.PI * 2
          this.rotationSpeed = (Math.random() - 0.5) * 0.05
        } else if (effect === 'stars') {
          this.x = Math.random() * canvas.width
          this.y = -10
          this.speed = Math.random() * 3 + 1
          this.size = Math.random() * 3 + 1
          this.opacity = Math.random() * 0.6 + 0.4
          this.angle = Math.random() * Math.PI * 2
          this.rotation = Math.random() * Math.PI * 2
          this.rotationSpeed = (Math.random() - 0.5) * 0.2
        }
      }

      update() {
        if (effect === 'snow') {
          this.y += this.speed
          this.x += Math.sin(this.angle) * 0.5
          this.angle += 0.01
          this.rotation += this.rotationSpeed
        } else if (effect === 'rain') {
          this.y += this.speed
          this.x += Math.sin(this.angle) * 2
        } else if (effect === 'leaves') {
          this.y += this.speed
          this.x += Math.sin(this.angle) * 1
          this.angle += 0.02
          this.rotation += this.rotationSpeed
        } else if (effect === 'stars') {
          this.y += this.speed
          this.x += Math.sin(this.angle) * 0.3
          this.angle += 0.005
          this.rotation += this.rotationSpeed
        }

        if (this.y > canvas.height + 10) {
          this.reset()
        }
      }

      draw() {
        if (!ctx) return
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)

        if (effect === 'snow') {
          ctx.beginPath()
          ctx.arc(0, 0, this.size, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
        } else if (effect === 'rain') {
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(0, this.size * 3)
          ctx.strokeStyle = '#87ceeb'
          ctx.lineWidth = this.size / 2
          ctx.stroke()
        } else if (effect === 'leaves') {
          ctx.fillStyle = '#8b4513'
          ctx.beginPath()
          ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2)
          ctx.fill()
          // Simple leaf shape
          ctx.beginPath()
          ctx.moveTo(0, -this.size)
          ctx.quadraticCurveTo(this.size * 0.5, 0, 0, this.size)
          ctx.quadraticCurveTo(-this.size * 0.5, 0, 0, -this.size)
          ctx.fillStyle = '#ff6b35'
          ctx.fill()
        } else if (effect === 'stars') {
          ctx.fillStyle = '#ffff00'
          ctx.beginPath()
          // Draw a simple star
          for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
            const x = Math.cos(angle) * this.size
            const y = Math.sin(angle) * this.size
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()
      }
    }

    // Create particles
    const particleCount = effect === 'rain' ? 200 : effect === 'snow' ? 100 : 50
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
      particles[i].y = Math.random() * canvas.height
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [effect])

  if (effect === 'none') {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}

