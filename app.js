/* =========================================================
   설천고 스포츠과학 훈련센터 PRO V2
   APP.JS

   MAIN APPLICATION CONTROLLER

   담당 기능
   - 시스템 초기화
   - 페이지 이동
   - 사이드바
   - 빠른 실행
   - 페이지 제목
   - 대시보드 통계
   - 각 모듈 초기화 연결

   ※ 선수 저장 / 자세 분석 / 리포트 등의 실제 기능은
      각각의 전용 JS 파일에서 담당
========================================================= */

"use strict";


/* =========================================================
   01. APP CONFIG
========================================================= */

const APP_CONFIG = {

  name: "설천고 스포츠과학 훈련센터 PRO V2",

  version: "2.0.0",

  defaultPage: "dashboard",

  pages: {

    dashboard: {
      title: "대시보드"
    },

    athletes: {
      title: "선수관리"
    },

    pose: {
      title: "자세분석"
    },

    weight: {
      title: "웨이트 자세분석"
    },

    pe: {
      title: "체대입시 실기분석"
    },

    reports: {
      title: "분석 리포트"
    }

  }

};


/* =========================================================
   02. APP STATE
========================================================= */

const AppState = {

  currentPage: APP_CONFIG.defaultPage,

  initialized: false,

  selectedAthleteId: null,

  selectedSport: null,

  selectedSeason: "summer",

  analysisMode: "camera",

  reportType: "athlete"

};


/* =========================================================
   03. DOM HELPERS
========================================================= */

function qs(selector) {
  return document.querySelector(selector);
}


function qsa(selector) {
  return [...document.querySelectorAll(selector)];
}


function byId(id) {
  return document.getElementById(id);
}


/* =========================================================
   04. PAGE NAVIGATION
========================================================= */

function navigateTo(pageName) {

  if (!APP_CONFIG.pages[pageName]) {
    console.warn(
      `[APP] 존재하지 않는 페이지: ${pageName}`
    );

    return;
  }


  /* 모든 페이지 숨기기 */

  qsa(".page").forEach(page => {
    page.classList.remove("active");
  });


  /* 대상 페이지 표시 */

  const targetPage =
    byId(`page-${pageName}`);

  if (targetPage) {
    targetPage.classList.add("active");
  }


  /* 네비게이션 버튼 */

  qsa(".nav-btn").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );

  });


  /* 제목 */

  const title =
    APP_CONFIG.pages[pageName].title;

  const pageTitle =
    byId("pageTitle");

  if (pageTitle) {
    pageTitle.textContent = title;
  }


  AppState.currentPage = pageName;


  /* 페이지별 갱신 */

  refreshPage(pageName);


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   05. PAGE REFRESH
========================================================= */

function refreshPage(pageName) {

  try {

    switch (pageName) {

      case "dashboard":

        updateDashboard();

        break;


      case "athletes":

        if (
          window.AthleteManager &&
          typeof window.AthleteManager.render === "function"
        ) {
          window.AthleteManager.render();
        }

        break;


      case "pose":

        refreshPosePage();

        break;


      case "weight":

        if (
          window.WeightAnalysis &&
          typeof window.WeightAnalysis.refresh === "function"
        ) {
          window.WeightAnalysis.refresh();
        }

        break;


      case "pe":

        if (
          window.PEExam &&
          typeof window.PEExam.refresh === "function"
        ) {
          window.PEExam.refresh();
        }

        break;


      case "reports":

        if (
          window.ReportManager &&
          typeof window.ReportManager.refresh === "function"
        ) {
          window.ReportManager.refresh();
        }

        break;

    }

  }

  catch (error) {

    console.error(
      `[APP] ${pageName} 페이지 갱신 오류`,
      error
    );

  }

}


/* =========================================================
   06. NAVIGATION EVENTS
========================================================= */

function setupNavigation() {

  const navButtons =
    qsa(".nav-btn");


  navButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.page;

        navigateTo(page);

      }
    );

  });

}


/* =========================================================
   07. QUICK START
========================================================= */

function setupQuickStart() {

  const buttons =
    qsa("[data-go]");


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.go;

        navigateTo(page);

      }
    );

  });

}


/* =========================================================
   08. DASHBOARD
========================================================= */

function updateDashboard() {

  let athletes = [];
  let analyses = [];
  let reports = [];


  /* -----------------------------------------
     StorageManager 연결
  ----------------------------------------- */

  try {

    if (window.StorageManager) {

      athletes =
        window.StorageManager.getAthletes?.() || [];

      analyses =
        window.StorageManager.getAnalyses?.() || [];

      reports =
        window.StorageManager.getReports?.() || [];

    }

  }

  catch (error) {

    console.warn(
      "[APP] 대시보드 데이터 로드 실패",
      error
    );

  }


  /* -----------------------------------------
     화면 표시
  ----------------------------------------- */

  const athleteCount =
    byId("dashboardAthletes");

  const analysisCount =
    byId("dashboardAnalyses");

  const reportCount =
    byId("dashboardReports");


  if (athleteCount) {
    athleteCount.textContent =
      athletes.length;
  }


  if (analysisCount) {
    analysisCount.textContent =
      analyses.length;
  }


  if (reportCount) {
    reportCount.textContent =
      reports.length;
  }

}


/* =========================================================
   09. POSE PAGE
========================================================= */

function refreshPosePage() {

  /* 선수 목록 갱신 */

  if (
    window.AthleteManager &&
    typeof window.AthleteManager.updateSelects === "function"
  ) {

    window.AthleteManager.updateSelects();

  }


  /* 종목 목록 갱신 */

  if (
    window.SportsAnalysis &&
    typeof window.SportsAnalysis.refreshSportSelect === "function"
  ) {

    window.SportsAnalysis.refreshSportSelect(
      AppState.selectedSeason
    );

  }

}


/* =========================================================
   10. SEASON BUTTONS
========================================================= */

function setupSeasonButtons() {

  const buttons =
    qsa(".season-btn");


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        buttons.forEach(btn => {
          btn.classList.remove("active");
        });


        button.classList.add("active");


        const season =
          button.dataset.season;


        AppState.selectedSeason =
          season;


        /* 종목 선택 초기화 */

        AppState.selectedSport = null;


        /* 종목 목록 변경 */

        if (
          window.SportsAnalysis &&
          typeof window.SportsAnalysis.refreshSportSelect === "function"
        ) {

          window.SportsAnalysis.refreshSportSelect(
            season
          );

        }

      }
    );

  });

}


/* =========================================================
   11. ANALYSIS MODE
========================================================= */

function setupAnalysisModes() {

  const buttons =
    qsa(".analysis-mode-btn");


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        buttons.forEach(btn => {
          btn.classList.remove("active");
        });


        button.classList.add("active");


        const mode =
          button.dataset.mode;


        AppState.analysisMode =
          mode;


        /* 카메라 / 영상 UI 전환 */

        if (
          window.CameraManager &&
          typeof window.CameraManager.setMode === "function"
        ) {

          window.CameraManager.setMode(
            mode
          );

        }

      }
    );

  });

}


/* =========================================================
   12. ANALYSIS TABS
========================================================= */

function setupAnalysisTabs() {

  const tabs =
    qsa(".analysis-tab");


  tabs.forEach(tab => {

    tab.addEventListener(
      "click",
      () => {

        tabs.forEach(item => {
          item.classList.remove("active");
        });


        tab.classList.add("active");


        const tabName =
          tab.dataset.tab;


        if (
          window.PoseAnalysis &&
          typeof window.PoseAnalysis.changeTab === "function"
        ) {

          window.PoseAnalysis.changeTab(
            tabName
          );

        }

      }
    );

  });

}


/* =========================================================
   13. REPORT TYPE
========================================================= */

function setupReportTypes() {

  const buttons =
    qsa(".report-type");


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        buttons.forEach(btn => {
          btn.classList.remove("active");
        });


        button.classList.add("active");


        const type =
          button.dataset.report;


        AppState.reportType =
          type;


        if (
          window.ReportManager &&
          typeof window.ReportManager.setType === "function"
        ) {

          window.ReportManager.setType(
            type
          );

        }

      }
    );

  });

}


/* =========================================================
   14. SELECTED ATHLETE
========================================================= */

function setSelectedAthlete(
  athleteId
) {

  AppState.selectedAthleteId =
    athleteId || null;


  /* 자세분석 선수 선택 */

  const poseSelect =
    byId("poseAthlete");


  if (poseSelect && athleteId) {
    poseSelect.value = athleteId;
  }


  /* 리포트 선수 선택 */

  const reportSelect =
    byId("reportAthlete");


  if (reportSelect && athleteId) {
    reportSelect.value = athleteId;
  }

}


/* =========================================================
   15. OPEN ATHLETE ANALYSIS
========================================================= */

function openAthleteAnalysis(
  athleteId
) {

  setSelectedAthlete(
    athleteId
  );


  navigateTo(
    "pose"
  );

}


/* =========================================================
   16. OPEN ATHLETE REPORT
========================================================= */

function openAthleteReport(
  athleteId
) {

  setSelectedAthlete(
    athleteId
  );


  AppState.reportType =
    "athlete";


  navigateTo(
    "reports"
  );


  qsa(".report-type").forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.report === "athlete"
      );

    }
  );


  if (
    window.ReportManager &&
    typeof window.ReportManager.setType === "function"
  ) {

    window.ReportManager.setType(
      "athlete"
    );

  }

}


/* =========================================================
   17. MODULE INITIALIZATION
========================================================= */

function initializeModules() {

  const modules = [

    {
      name: "StorageManager",
      object: window.StorageManager
    },

    {
      name: "AthleteManager",
      object: window.AthleteManager
    },

    {
      name: "CameraManager",
      object: window.CameraManager
    },

    {
      name: "PoseAnalysis",
      object: window.PoseAnalysis
    },

    {
      name: "SportsAnalysis",
      object: window.SportsAnalysis
    },

    {
      name: "WeightAnalysis",
      object: window.WeightAnalysis
    },

    {
      name: "PEExam",
      object: window.PEExam
    },

    {
      name: "ReportManager",
      object: window.ReportManager
    }

  ];


  modules.forEach(module => {

    try {

      if (
        module.object &&
        typeof module.object.init === "function"
      ) {

        module.object.init();

        console.log(
          `[APP] ${module.name} initialized`
        );

      }

    }

    catch (error) {

      console.error(
        `[APP] ${module.name} 초기화 실패`,
        error
      );

    }

  });

}


/* =========================================================
   18. GLOBAL ERROR HANDLER
========================================================= */

window.addEventListener(
  "error",
  event => {

    console.error(
      "[SYSTEM ERROR]",
      event.error || event.message
    );

  }
);


/* =========================================================
   19. UNHANDLED PROMISE
========================================================= */

window.addEventListener(
  "unhandledrejection",
  event => {

    console.error(
      "[PROMISE ERROR]",
      event.reason
    );

  }
);


/* =========================================================
   20. APP INIT
========================================================= */

function initializeApp() {

  if (AppState.initialized) {
    return;
  }


  console.log(
    "======================================"
  );

  console.log(
    APP_CONFIG.name
  );

  console.log(
    `VERSION ${APP_CONFIG.version}`
  );

  console.log(
    "SYSTEM INITIALIZING..."
  );

  console.log(
    "======================================"
  );


  /* -----------------------------------------
     UI 이벤트
  ----------------------------------------- */

  setupNavigation();

  setupQuickStart();

  setupSeasonButtons();

  setupAnalysisModes();

  setupAnalysisTabs();

  setupReportTypes();


  /* -----------------------------------------
     모듈
  ----------------------------------------- */

  initializeModules();


  /* -----------------------------------------
     첫 화면
  ----------------------------------------- */

  navigateTo(
    APP_CONFIG.defaultPage
  );


  updateDashboard();


  AppState.initialized =
    true;


  console.log(
    "[APP] SYSTEM READY"
  );

}


/* =========================================================
   21. DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


/* =========================================================
   22. GLOBAL API

   다른 JS 파일에서 아래 기능을 사용할 수 있음.

   예)
   App.navigate("pose");
   App.openAthleteAnalysis("athlete-id");
========================================================= */

window.App = {

  config:
    APP_CONFIG,

  state:
    AppState,


  navigate:
    navigateTo,


  refresh:
    refreshPage,


  updateDashboard:
    updateDashboard,


  setSelectedAthlete:
    setSelectedAthlete,


  openAthleteAnalysis:
    openAthleteAnalysis,


  openAthleteReport:
    openAthleteReport

};