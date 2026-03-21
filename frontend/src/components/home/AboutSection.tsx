'use client'

import React from 'react'

export default function AboutSection() {
  return (
    <div style={{
      width: '100vw',
      background: '#030a0a',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '80px clamp(24px, 8vw, 120px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 48,
    }}>

      {/* top row */}
      <div style={{
        width: '100%',
        maxWidth: 960,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 40,
      }}>

        {/* brand */}
        <div style={{ maxWidth: 320 }}>
          <div style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#cedadb',
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}>
            Tasker
          </div>
          <p style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.35)',
            lineHeight: 1.7,
          }}>
            A clean, fast task manager built to keep you focused — not overwhelmed.
          </p>
        </div>

        {/* links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
            fontWeight: 600,
            marginBottom: 4,
          }}>
            Contact
          </div>

          {/* email */}
          <a
            href="mailto:debarkomandal@gmail.com"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: 14,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
              (e.currentTarget.style.color = '#6dadbe')
            }
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
              (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            your@email.com
          </a>

          {/* github */}
          <a
            href="https://github.com/Da9TH5e"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: 14,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
              (e.currentTarget.style.color = '#6dadbe')
            }
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
              (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            github.com/Da9TH5e
          </a>
        </div>
      </div>

      {/* divider */}
      <div style={{
        width: '100%',
        maxWidth: 960,
        height: 1,
        background: 'rgba(255,255,255,0.06)',
      }}/>

      {/* bottom row */}
      <div style={{
        width: '100%',
        maxWidth: 960,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} Tasker. Built with care.
        </span>
        <span style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.15)',
          letterSpacing: '0.05em',
        }}>
          Made with Next.js &amp; TypeScript
        </span>
      </div>

    </div>
  )
}