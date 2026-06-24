// React ko import kar rahe hain taaki JSX syntax use kar saken (Next.js 14+ mein zaroori nahi, par standard practice hai)
import React from 'react';
import Link from 'next/link';

/**
 * LandingPage Component
 * Yeh hamare application ka main (home) page hai.
 * Isme aesthetic UI design implement kiya gaya hai jo user ne manga tha (soft pink/lavender theme).
 * Har ek line ke upar comment diya gaya hai jaisa user ne request kiya.
 */
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  // Return statement se hum JSX (UI) render karte hain
  return (
    // Main container div banaya hai jisme screen ki poori height aur width cover ki jayegi
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      
      {/* Top Navbar ya Header section ka simulation */}
      <header className="header-container">
        
        {/* Logo text jo left side mein dikhega */}
        <div style={{ fontSize: '24px', fontWeight: 'bold', fontStyle: 'italic', color: '#1e1b4b' }}>
          {/* Platform ka naam */}
          TestPlatform
        </div>

        {/* Navigation links aur let's talk button ka container */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          
          <div className="nav-links">
            {/* About link */}
            <span style={{ fontSize: '15px', fontWeight: '500', color: '#4f46e5', cursor: 'pointer' }}>About</span>
            
            {/* Work link */}
            <span style={{ fontSize: '15px', fontWeight: '500', color: '#4f46e5', cursor: 'pointer' }}>Features</span>
            
            {/* Services link */}
            <span style={{ fontSize: '15px', fontWeight: '500', color: '#4f46e5', cursor: 'pointer' }}>Pricing</span>
          </div>
          
          {/* Clerk Auth Controls */}
          <Show when="signed-out">
            {/* SignedOut section tab dikhega jab user logged in nahi hoga */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <SignInButton mode="modal">
                <button className="btn btn-light" style={{ padding: '8px 16px', fontSize: '14px' }}>Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-dark" style={{ padding: '8px 16px', fontSize: '14px' }}>Sign Up</button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            {/* SignedIn section tab dikhega jab user logged in hoga */}
            <UserButton afterSignOutUrl="/" />
          </Show>
        </div>
      </header>

      {/* Ek chota sa badge/pill top pe dikhane ke liye (Aesthetic touch) */}
      <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '6px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: '500', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        {/* Pink dot badge ke andar */}
        <span style={{ width: '8px', height: '8px', backgroundColor: '#ec4899', borderRadius: '50%', display: 'inline-block' }}></span>
        {/* Badge ka text */}
        Next-Gen Assessment Engine v1.0
      </div>

      {/* Main hero section ka title */}
      <h1 className="hero-title">
        {/* Title ka first half (Dark color) */}
        Enterprise-Grade <span className="text-gradient">Assessment Platform</span>
      </h1>

      {/* Hero section ka subtitle / description paragraph */}
      <p className="hero-subtitle">
        {/* Description text */}
        Empower your institution with secure, scalable, and intelligent evaluation tools. Designed for academic excellence.
      </p>

      {/* Call to action (CTA) buttons ka container */}
      <div className="hero-buttons">
        
        {/* Pehla primary dark button */}
        <Link href="/admin/create-test" style={{ textDecoration: 'none', width: '100%' }}>
          <button className="btn btn-dark" style={{ fontSize: '16px', padding: '14px 32px', width: '100%' }}>
            {/* Play icon (text representation for now) */}
            ▶ 
            {/* Button text */}
            Get Started as Admin
          </button>
        </Link>

        {/* Dusra secondary light button (Glass effect wala) */}
        <Link href="/student/join" style={{ textDecoration: 'none', width: '100%' }}>
          <button className="btn btn-light" style={{ fontSize: '16px', padding: '14px 32px', width: '100%' }}>
            {/* Telegram/Send icon (text representation) */}
            ↗ 
            {/* Button text */}
            Join Assessment
          </button>
        </Link>
      </div>

      {/* Bottom section jahan exams ke naam likhe hain */}
      <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', opacity: 0.5 }}>
        {/* Pehla exam tag */}
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>NEET</span>
        {/* Dusra exam tag */}
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>JEE</span>
        {/* Teesra exam tag */}
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>IAS</span>
      </div>

      {/* Ek downward pointing arrow decoration ke liye */}
      <div style={{ marginTop: '30px', fontSize: '24px', opacity: 0.3 }}>
        {/* Arrow unicode character */}
        ↓
      </div>

    </div>
  );
}
