// src/components/academy/CertificateView.jsx — Verifiable Certificates & Public Verification Tool
import React, { useState } from 'react';
import { waterEngineeringCourse } from '../../data/courses/waterEngineeringCourse';
import { getStudentProgress, checkCertificateEligibility, saveIssuedCertificate } from '../../services/progressService';
import { generateCertificate, verifyCertificate, printOrDownloadCertificate } from '../../services/certificateService';
import '../../styles/academy.css';

export default function CertificateView({
  user,
  dark,
  onNavigateCourse
}) {
  const course = waterEngineeringCourse;
  const progress = getStudentProgress(user?.id);
  const eligibility = checkCertificateEligibility(user?.id, course);

  // Issued certificates for this student
  let userCerts = progress.certificates || [];
  if (userCerts.length === 0 && eligibility.eligible) {
    const autoCert = generateCertificate({
      userId: user?.id,
      studentName: user?.name,
      courseId: course.id,
      courseTitle: course.title,
      scorePct: progress.finalExam?.percentage || 85
    });
    saveIssuedCertificate(user?.id, autoCert);
    userCerts = [autoCert];
  }

  // Public Verification State
  const [verifyIdInput, setVerifyIdInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  const handleVerify = () => {
    if (!verifyIdInput.trim()) return;
    const res = verifyCertificate(verifyIdInput.trim());
    setVerifyResult(res);
  };

  return (
    <div className="ll-academy-container">
      <div style={{
        background: dark ? '#111827' : '#FFFFFF',
        border: '1px solid var(--ll-border, #1E293B)',
        borderRadius: 18,
        padding: '28px 32px',
        marginBottom: 32
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <span className="ll-tag ll-tag-success">Official Credentials</span>
          <span style={{ fontSize: 12, color: dark ? '#94A3B8' : '#475569' }}>Cryptographically Verified Registry</span>
        </div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', color: dark ? '#FFFFFF' : '#0F172A' }}>
          Course Completion Certificates
        </h1>
        <p style={{ fontSize: 14, color: dark ? '#94A3B8' : '#334155', margin: 0, maxWidth: 740, lineHeight: 1.6 }}>
          LearnLoop AI Academy credentials certify verified outcome-based mastery of civil engineering curricula aligned with university guidelines and GATE standards.
        </p>
      </div>

      {/* Checklist & Status Card */}
      <div style={{
        background: dark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.03)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 32
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: dark ? '#FFFFFF' : '#0F172A' }}>
              Certificate Qualification Status: {course.title}
            </h3>
            <span style={{ fontSize: 12, color: dark ? '#94A3B8' : '#475569' }}>42 Planned Core Hours · Core Civil Engineering Curriculum</span>
          </div>

          <span className={`ll-tag ${eligibility.eligible ? 'll-tag-success' : 'll-tag-warn'}`}>
            {eligibility.eligible ? '✓ Requirements Satisfied' : 'Pending Requirements'}
          </span>
        </div>

        {/* Requirements Checklist */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <div style={{
            background: dark ? '#111827' : '#FFFFFF',
            padding: '14px 16px',
            borderRadius: 12,
            border: `1px solid ${eligibility.completedLessonsCount >= eligibility.totalLessons ? '#10B981' : 'var(--ll-border, #1E293B)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
              <span>{eligibility.completedLessonsCount >= eligibility.totalLessons ? '✅' : '⏳'}</span>
              <span style={{ color: dark ? '#F1F5F9' : '#0F172A' }}>All Lessons Completed</span>
            </div>
            <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', marginTop: 4 }}>
              {eligibility.completedLessonsCount} of {eligibility.totalLessons} lessons completed
            </div>
          </div>

          <div style={{
            background: dark ? '#111827' : '#FFFFFF',
            padding: '14px 16px',
            borderRadius: 12,
            border: `1px solid ${eligibility.modulesPassed === eligibility.totalModules ? '#10B981' : 'var(--ll-border, #1E293B)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
              <span>{eligibility.modulesPassed === eligibility.totalModules ? '✅' : '⏳'}</span>
              <span style={{ color: dark ? '#F1F5F9' : '#0F172A' }}>6 Module Assessments (≥70%)</span>
            </div>
            <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', marginTop: 4 }}>
              {eligibility.modulesPassed} of 6 unit assessments passed
            </div>
          </div>

          <div style={{
            background: dark ? '#111827' : '#FFFFFF',
            padding: '14px 16px',
            borderRadius: 12,
            border: `1px solid ${eligibility.finalExam?.passed ? '#10B981' : 'var(--ll-border, #1E293B)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
              <span>{eligibility.finalExam?.passed ? '✅' : '⏳'}</span>
              <span style={{ color: dark ? '#F1F5F9' : '#0F172A' }}>Final Examination (≥70%)</span>
            </div>
            <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', marginTop: 4 }}>
              {eligibility.finalExam ? `${eligibility.finalExam.percentage}% scored` : 'Not attempted yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Earned Certificate Cards */}
      {userCerts.length > 0 ? (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 18 }}>
            Your Earned Certificates
          </h2>

          {userCerts.map(cert => (
            <div key={cert.id} className="ll-cert-card" style={{
              background: dark ? 'radial-gradient(circle at 50% 30%, #151C2C 0%, #0A0D14 100%)' : '#FFFFFF',
              border: '2px solid #6366F1',
              borderRadius: 20,
              padding: '32px 36px',
              marginBottom: 20,
              boxShadow: '0 12px 40px rgba(99,102,241,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#818CF8', letterSpacing: 1, textTransform: 'uppercase' }}>
                    LearnLoop AI Academy · StructaMind
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: dark ? '#FFFFFF' : '#0F172A', margin: '4px 0' }}>
                    {cert.courseTitle}
                  </h3>
                  <div style={{ fontSize: 13, color: dark ? '#94A3B8' : '#334155' }}>
                    Recipient: <strong style={{ color: '#38BDF8' }}>{cert.studentName}</strong> · Issued on {cert.issueDateFormatted}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="ll-tag ll-tag-success" style={{ fontSize: 12, padding: '6px 12px' }}>
                    {cert.grade} ({cert.scorePct}%)
                  </span>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#818CF8', marginTop: 8 }}>
                    ID: {cert.id}
                  </div>
                </div>
              </div>

              <div style={{
                borderTop: '1px solid var(--ll-border, #1E293B)',
                paddingTop: 18,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569' }}>
                  Aligned with Core Civil Engineering curriculum & GATE CE / ES integrated competencies · 42 core hours
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => printOrDownloadCertificate(cert)}
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 20px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    🖨️ Print / Download PDF
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cert.id);
                      alert(`Certificate ID ${cert.id} copied to clipboard! Anyone can verify it in the tool below.`);
                    }}
                    style={{
                      background: 'transparent',
                      color: dark ? '#94A3B8' : '#334155',
                      border: '1px solid var(--ll-border, #1E293B)',
                      borderRadius: 10,
                      padding: '10px 16px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    📋 Copy ID
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: dark ? '#111827' : '#FFFFFF',
          border: '1px dashed var(--ll-border, #1E293B)',
          borderRadius: 16,
          padding: '40px 24px',
          textAlign: 'center',
          marginBottom: 40
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, margin: '0 0 8px 0', color: dark ? '#FFFFFF' : '#0F172A' }}>
            Certificate Currently Locked
          </h3>
          <p style={{ fontSize: 14, color: dark ? '#94A3B8' : '#334155', maxWidth: 500, margin: '0 auto 20px auto', lineHeight: 1.6 }}>
            Complete the required lessons, pass the 6 module assessments, and achieve ≥70% in the final examination to unlock your verifiable credential.
          </p>
          <button
            onClick={onNavigateCourse}
            style={{
              background: '#6366F1',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Continue Learning to Earn Certificate →
          </button>
        </div>
      )}

      {/* ── PUBLIC CERTIFICATE VERIFICATION TOOL (Section 10) ── */}
      <div style={{
        background: dark ? '#111827' : '#FFFFFF',
        border: '1px solid var(--ll-border, #1E293B)',
        borderRadius: 18,
        padding: '28px 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>🔍</span>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, margin: 0, color: dark ? '#FFFFFF' : '#0F172A' }}>
            Public Credential Verification
          </h2>
        </div>
        <p style={{ fontSize: 13, color: dark ? '#94A3B8' : '#475569', margin: '0 0 20px 0', lineHeight: 1.6 }}>
          Employers, universities, and students can verify the authenticity of any LearnLoop AI Certificate of Completion using its unique Certificate ID.
        </p>

        <div style={{ display: 'flex', gap: 12, maxWidth: 600, marginBottom: 18 }}>
          <input
            type="text"
            placeholder="Enter Certificate ID (e.g. LL-2027-WSE-A1B2C3)"
            value={verifyIdInput}
            onChange={(e) => setVerifyIdInput(e.target.value)}
            style={{
              flex: 1,
              background: dark ? '#0D1117' : '#F8FAFC',
              color: dark ? '#fff' : '#0F172A',
              border: '1px solid var(--ll-border, #1E293B)',
              borderRadius: 10,
              padding: '12px 16px',
              fontFamily: 'monospace',
              fontSize: 14,
              outline: 'none'
            }}
          />
          <button
            onClick={handleVerify}
            style={{
              background: '#6366F1',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Verify Authenticity
          </button>
        </div>

        {/* Verification Result Card */}
        {verifyResult && (
          <div style={{
            background: verifyResult.valid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${verifyResult.valid ? '#10B981' : '#EF4444'}`,
            borderRadius: 12,
            padding: '18px 22px',
            maxWidth: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, color: verifyResult.valid ? '#10B981' : '#EF4444', marginBottom: 8 }}>
              <span>{verifyResult.valid ? '✓ Verified Official LearnLoop Credential' : '❌ Verification Failed'}</span>
            </div>

            {verifyResult.valid ? (
              <div style={{ fontSize: 13, color: dark ? '#CBD5E1' : '#1E293B', lineHeight: 1.6 }}>
                <div><strong>Recipient:</strong> {verifyResult.studentName}</div>
                <div><strong>Course:</strong> {verifyResult.courseTitle}</div>
                <div><strong>Curriculum:</strong> {verifyResult.curriculumBasis || 'Core Civil Engineering Curriculum · GATE CE & ES'}</div>
                <div><strong>Issue Date:</strong> {verifyResult.issueDateFormatted}</div>
                <div><strong>Status:</strong> <span style={{ color: '#10B981' }}>{verifyResult.status}</span> ({verifyResult.hours || 42} Core Hours)</div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#F87171' }}>
                {verifyResult.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
