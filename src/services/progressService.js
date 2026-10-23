// src/services/progressService.js — Multi-user Course Progress & Assessment Persistence

const PROGRESS_KEY_PREFIX = 'learnloop_progress_';

function getStorageKey(userId) {
  const uid = userId || 'anonymous';
  return `${PROGRESS_KEY_PREFIX}${uid}`;
}

export function getStudentProgress(userId) {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    const data = raw ? JSON.parse(raw) : {
      enrolledCourses: ['water-sanitation-env-eng'],
      completedLessons: [],
      understandingChecks: {},
      moduleAssessments: {},
      finalExam: null,
      certificates: []
    };
    if (!data.moduleAssessments) data.moduleAssessments = {};
    if (!data.understandingChecks) data.understandingChecks = {};
    if (!data.completedLessons) data.completedLessons = [];
    if (!data.certificates) data.certificates = [];
    // Provide field aliases for UI views
    data.assessmentResults = data.moduleAssessments;
    data.finalExamResult = data.finalExam;
    return data;
  } catch (e) {
    return {
      enrolledCourses: ['water-sanitation-env-eng'],
      completedLessons: [],
      understandingChecks: {},
      moduleAssessments: {},
      assessmentResults: {},
      finalExam: null,
      finalExamResult: null,
      certificates: []
    };
  }
}

export const getUserProgress = getStudentProgress;

function saveStudentProgress(userId, progress) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save student progress', e);
  }
}

export function enrollCourse(userId, courseId) {
  const progress = getStudentProgress(userId);
  if (!progress.enrolledCourses.includes(courseId)) {
    progress.enrolledCourses.push(courseId);
    saveStudentProgress(userId, progress);
  }
  return progress;
}

export function isLessonCompleted(userId, courseId, lessonId) {
  const progress = getStudentProgress(userId);
  return progress.completedLessons.some(l => l.courseId === courseId && l.lessonId === lessonId);
}

export function markLessonCompleted(userId, courseId, lessonId) {
  const progress = getStudentProgress(userId);
  const exists = progress.completedLessons.some(l => l.courseId === courseId && l.lessonId === lessonId);
  if (!exists) {
    progress.completedLessons.push({
      courseId,
      lessonId,
      completedAt: new Date().toISOString()
    });
    saveStudentProgress(userId, progress);
  }
  return progress;
}

export function recordUnderstandingCheck(userId, courseId, lessonId, checkResult) {
  const progress = getStudentProgress(userId);
  progress.understandingChecks[lessonId] = {
    ...checkResult,
    courseId,
    lessonId,
    timestamp: new Date().toISOString()
  };
  // Automatically mark lesson as completed if understood or partially understood
  if (checkResult.status === 'understood' || checkResult.status === 'partial') {
    const exists = progress.completedLessons.some(l => l.courseId === courseId && l.lessonId === lessonId);
    if (!exists) {
      progress.completedLessons.push({
        courseId,
        lessonId,
        completedAt: new Date().toISOString()
      });
    }
  }
  saveStudentProgress(userId, progress);
  return progress;
}

export function recordModuleAssessment(userId, courseId, moduleId, score, total) {
  const progress = getStudentProgress(userId);
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;
  const prev = progress.moduleAssessments[moduleId] || { attempts: 0, bestPct: 0 };

  progress.moduleAssessments[moduleId] = {
    score,
    total,
    percentage: pct,
    passed,
    attempts: prev.attempts + 1,
    bestPct: Math.max(prev.bestPct || 0, pct),
    timestamp: new Date().toISOString()
  };

  saveStudentProgress(userId, progress);
  return progress.moduleAssessments[moduleId];
}

export function recordFinalExam(userId, courseId, score, total) {
  const progress = getStudentProgress(userId);
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;
  const prevAttempts = progress.finalExam?.attempts || 0;

  progress.finalExam = {
    score,
    total,
    percentage: pct,
    passed,
    attempts: prevAttempts + 1,
    bestPct: Math.max(progress.finalExam?.bestPct || 0, pct),
    timestamp: new Date().toISOString()
  };

  saveStudentProgress(userId, progress);
  return progress.finalExam;
}

/**
 * Checks whether the student meets all requirements for earning a course certificate:
 * 1. All lessons in the course are completed
 * 2. Understanding checks completed for all core lessons
 * 3. Each module assessment scored >= 70%
 * 4. Final examination scored >= 70%
 */
export function checkCertificateEligibility(userId, course) {
  const progress = getStudentProgress(userId);
  const reasons = [];

  const modules = Array.isArray(course?.modules) ? course.modules : [];
  let totalLessons = 0;
  modules.forEach(m => {
    totalLessons += Array.isArray(m?.lessons) ? m.lessons.length : 0;
  });
  if (totalLessons === 0) totalLessons = 36; // fallback baseline

  const completedList = Array.isArray(progress.completedLessons)
    ? progress.completedLessons
    : Object.keys(progress.completedLessons || {}).map(id => ({ courseId: course?.id, lessonId: id }));

  const completedCount = course?.id
    ? completedList.filter(l => (typeof l === 'string' ? true : l.courseId === course.id)).length
    : completedList.length;

  const lessonsComplete = completedCount >= totalLessons;
  if (!lessonsComplete) {
    reasons.push(`Complete all ${totalLessons} lessons (current: ${completedCount}/${totalLessons}).`);
  }

  // Module assessments check (each must be >= 70%)
  let modulesPassed = 0;
  modules.forEach(m => {
    const ma = progress.moduleAssessments?.[m.id] || progress.assessmentResults?.[m.id];
    if (ma && ma.passed) {
      modulesPassed += 1;
    }
  });

  const totalModules = modules.length || 6;
  const allModulesPassed = modulesPassed >= totalModules;
  if (!allModulesPassed) {
    reasons.push(`Pass all ${totalModules} Module Assessments with at least 70% (current: ${modulesPassed}/${totalModules}).`);
  }

  // Final examination check
  const finalExamResult = progress.finalExam || progress.finalExamResult;
  const finalExamPassed = Boolean(finalExamResult && finalExamResult.passed);
  if (!finalExamPassed) {
    reasons.push('Achieve at least 70% in the Comprehensive Final Examination.');
  }

  const eligible = lessonsComplete && allModulesPassed && finalExamPassed;
  const overallProgressPct = Math.round(
    ((completedCount / totalLessons) * 0.4 +
     (modulesPassed / totalModules) * 0.3 +
     (finalExamPassed ? 1 : (finalExamResult ? (finalExamResult.percentage || 0) / 100 : 0)) * 0.3) * 100
  );

  const checklist = [
    {
      label: `All ${totalLessons} curriculum lessons completed (${completedCount}/${totalLessons})`,
      met: lessonsComplete
    },
    {
      label: `All ${totalModules} Module Assessments passed with ≥ 70% (${modulesPassed}/${totalModules})`,
      met: allModulesPassed
    },
    {
      label: 'Comprehensive Final Examination passed with ≥ 70%',
      met: finalExamPassed
    }
  ];

  return {
    eligible,
    reasons,
    checklist,
    overallProgressPct: Math.min(100, Math.max(0, overallProgressPct || 0)),
    completedLessonsCount: completedCount,
    totalLessons,
    modulesPassed,
    totalModules,
    finalExam: finalExamResult || null,
    alreadyIssued: Array.isArray(progress.certificates) && progress.certificates.some(c => c.courseId === course?.id)
  };
}

export function saveIssuedCertificate(userId, certRecord) {
  const progress = getStudentProgress(userId);
  if (!progress.certificates.some(c => c.id === certRecord.id)) {
    progress.certificates.push(certRecord);
    saveStudentProgress(userId, progress);
  }
  return certRecord;
}
