import type { AppLanguage } from '../context/AppSettingsContext';

type SiteCopy = {
  common: {
    brand: string;
    signIn: string;
    signUp: string;
    dashboard: string;
  };
  controls: {
    lightMode: string;
    darkMode: string;
    switchTheme: string;
    language: string;
    english: string;
    thai: string;
  };
  landing: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    socialProofLabel: string;
    socialProofItems: string[];
    statUptimeLabel: string;
    statModelsLabel: string;
    statTeamsLabel: string;
    featureTitle: string;
    featureDescription: string;
    features: Array<{
      title: string;
      description: string;
    }>;
    previewTitle: string;
    previewDescription: string;
    liveBadge: string;
    previewCards: Array<{
      label: string;
      value: string;
      caption: string;
    }>;
  };
  auth: {
    backHome: string;
    signInTitle: string;
    signInDescription: string;
    signUpTitle: string;
    signUpDescription: string;
    noAccount: string;
    createAccount: string;
    alreadyHaveAccount: string;
    signInLink: string;
    loginFailed: string;
    registrationFailed: string;
    googleSignInFailed: string;
    googleSignUpFailed: string;
    googleConfigError: string;
    googleBackendConfigError: string;
    googleInvalidTokenError: string;
  };
  header: {
    notifications: string;
    markAllRead: string;
    noNotifications: string;
  };
  sidebar: {
    navigation: string;
    search: string;
    noResults: string;
    expandSidebar: string;
    collapseSidebar: string;
    sections: {
      overview: string;
      developer: string;
      support: string;
    };
    items: {
      overview: string;
      usage: string;
      logs: string;
      apiKeys: string;
      models: string;
      integrations: string;
      status: string;
      community: string;
      manageUsers: string;
    };
    user: string;
    administrator: string;
    standardUser: string;
    logout: string;
  };
};

export const siteCopy: Record<AppLanguage, SiteCopy> = {
  en: {
    common: {
      brand: 'AiStudio',
      signIn: 'Sign in',
      signUp: 'Create account',
      dashboard: 'Dashboard',
    },
    controls: {
      lightMode: 'Light mode',
      darkMode: 'Dark mode',
      switchTheme: 'Switch theme',
      language: 'Language',
      english: 'English',
      thai: 'Thai',
    },
    landing: {
      badge: 'AI workspace',
      title: 'Manage your AI gateway in one clean dashboard',
      description:
        'Monitor usage, manage API keys, and connect model providers from a modern workspace designed for fast teams.',
      primaryCta: 'Get started',
      secondaryCta: 'Open dashboard',
      socialProofLabel: 'Built for product teams, internal tools, and API operations',
      socialProofItems: ['Usage analytics', 'Key management', 'Provider integrations'],
      statUptimeLabel: 'Platform uptime',
      statModelsLabel: 'Connected models',
      statTeamsLabel: 'Teams onboarded',
      featureTitle: 'Everything you need to launch faster',
      featureDescription:
        'The landing page keeps the product simple and polished while pointing users directly to the core workflows.',
      features: [
        {
          title: 'Unified monitoring',
          description: 'Track requests, health status, and usage trends from a single view.',
        },
        {
          title: 'Ready for operators',
          description: 'Move from sign-in to key creation and model setup without extra steps.',
        },
        {
          title: 'Localized experience',
          description: 'Switch between English and Thai instantly with a persistent preference.',
        },
      ],
      previewTitle: 'Quick overview',
      previewDescription: 'A preview block that matches the project theme and highlights the main value immediately.',
      liveBadge: 'Live',
      previewCards: [
        {
          label: 'Requests today',
          value: '128.4K',
          caption: 'Real-time request tracking',
        },
        {
          label: 'Healthy services',
          value: '12/12',
          caption: 'Operational providers online',
        },
        {
          label: 'Avg. response',
          value: '1.8s',
          caption: 'Fast enough for production traffic',
        },
      ],
    },
    auth: {
      backHome: 'Back to home',
      signInTitle: 'Welcome back',
      signInDescription: 'Sign in to manage your API keys, usage, and integration settings.',
      signUpTitle: 'Create account',
      signUpDescription: 'Create an account to access the portal and start generating API keys.',
      noAccount: "Don't have an account yet?",
      createAccount: 'Create account',
      alreadyHaveAccount: 'Already have an account?',
      signInLink: 'Sign in',
      loginFailed: 'Login failed',
      registrationFailed: 'Registration failed',
      googleSignInFailed: 'Google Sign-In failed',
      googleSignUpFailed: 'Google Sign-Up failed',
      googleConfigError:
        'Google Sign-In is not available for this domain yet. Please check the Google Client ID and Authorized JavaScript Origins settings.',
      googleBackendConfigError:
        'Google Sign-In is not configured correctly on the server yet. Please verify the backend Google Client ID configuration.',
      googleInvalidTokenError:
        'Google returned an invalid sign-in token. Please try again. If the problem continues, check the Google client configuration.',
    },
    header: {
      notifications: 'Notifications',
      markAllRead: 'Mark all read',
      noNotifications: 'You have no new notifications.',
    },
    sidebar: {
      navigation: 'Navigation',
      search: 'Search',
      noResults: 'No matching items',
      expandSidebar: 'Expand sidebar',
      collapseSidebar: 'Collapse sidebar',
      sections: {
        overview: 'OVERVIEW',
        developer: 'DEVELOPER',
        support: 'SUPPORT',
      },
      items: {
        overview: 'Overview',
        usage: 'Usage',
        logs: 'Request logs',
        apiKeys: 'API keys',
        models: 'Models',
        integrations: 'Integrations',
        status: 'Status',
        community: 'Community',
        manageUsers: 'Manage Users',
      },
      user: 'User',
      administrator: 'Administrator',
      standardUser: 'Standard User',
      logout: 'Log out',
    },
  },
  th: {
    common: {
      brand: 'AiStudio',
      signIn: 'เข้าสู่ระบบ',
      signUp: 'สมัครสมาชิก',
      dashboard: 'แดชบอร์ด',
    },
    controls: {
      lightMode: 'โหมดสว่าง',
      darkMode: 'โหมดมืด',
      switchTheme: 'สลับธีม',
      language: 'ภาษา',
      english: 'English',
      thai: 'ไทย',
    },
    landing: {
      badge: 'พื้นที่ทำงาน AI โทนน้ำเงิน-ขาว',
      title: 'จัดการ AI gateway ของคุณได้ในแดชบอร์ดที่สะอาดและใช้งานง่าย',
      description:
        'ติดตามการใช้งาน จัดการ API key และเชื่อมต่อผู้ให้บริการโมเดลจากหน้าจอเดียวที่ออกแบบมาเพื่อทีมที่ต้องการความเร็ว',
      primaryCta: 'เริ่มใช้งาน',
      secondaryCta: 'เปิดแดชบอร์ด',
      socialProofLabel: 'ออกแบบมาสำหรับทีมโปรดักต์ เครื่องมือภายใน และงานดูแล API',
      socialProofItems: ['สรุปการใช้งาน', 'จัดการคีย์', 'เชื่อมต่อผู้ให้บริการ'],
      statUptimeLabel: 'ความพร้อมใช้งาน',
      statModelsLabel: 'โมเดลที่เชื่อมต่อ',
      statTeamsLabel: 'ทีมที่เริ่มใช้งาน',
      featureTitle: 'ครบสำหรับการเริ่มต้นใช้งานอย่างรวดเร็ว',
      featureDescription:
        'หน้า landing ถูกออกแบบให้ดูเรียบสะอาด และพาผู้ใช้ไปยัง workflow หลักของระบบได้ทันที',
      features: [
        {
          title: 'มอนิเตอร์รวมศูนย์',
          description: 'ดูคำขอ สถานะระบบ และแนวโน้มการใช้งานได้จากมุมมองเดียว',
        },
        {
          title: 'พร้อมสำหรับผู้ดูแลระบบ',
          description: 'จากการเข้าสู่ระบบไปถึงการสร้างคีย์และตั้งค่าโมเดลได้โดยไม่ต้องวนหลายหน้า',
        },
        {
          title: 'รองรับหลายภาษา',
          description: 'สลับภาษาไทยและอังกฤษได้ทันที พร้อมจำค่าที่เลือกไว้ให้',
        },
      ],
      previewTitle: 'ภาพรวมแบบรวดเร็ว',
      previewDescription: 'บล็อกตัวอย่างที่เข้ากับธีมของโปรเจกต์และสื่อคุณค่าหลักได้ตั้งแต่แรกเห็น',
      liveBadge: 'สด',
      previewCards: [
        {
          label: 'คำขอวันนี้',
          value: '128.4K',
          caption: 'ติดตาม request แบบเรียลไทม์',
        },
        {
          label: 'บริการพร้อมใช้งาน',
          value: '12/12',
          caption: 'ผู้ให้บริการที่ออนไลน์อยู่ตอนนี้',
        },
        {
          label: 'เวลาตอบสนองเฉลี่ย',
          value: '1.8s',
          caption: 'เร็วพอสำหรับทราฟฟิกจริง',
        },
      ],
    },
    auth: {
      backHome: 'กลับหน้าแรก',
      signInTitle: 'ยินดีต้อนรับกลับ',
      signInDescription: 'เข้าสู่ระบบเพื่อจัดการ API key การใช้งาน และการตั้งค่าการเชื่อมต่อของคุณ',
      signUpTitle: 'สร้างบัญชีผู้ใช้',
      signUpDescription: 'สมัครสมาชิกเพื่อใช้งานพอร์ทัลและเริ่มสร้าง API key ได้ทันที',
      noAccount: 'ยังไม่มีบัญชีผู้ใช้?',
      createAccount: 'สมัครสมาชิก',
      alreadyHaveAccount: 'มีบัญชีผู้ใช้อยู่แล้ว?',
      signInLink: 'เข้าสู่ระบบ',
      loginFailed: 'เข้าสู่ระบบไม่สำเร็จ',
      registrationFailed: 'สมัครสมาชิกไม่สำเร็จ',
      googleSignInFailed: 'Google Sign-In ไม่สำเร็จ',
      googleSignUpFailed: 'Google Sign-Up ไม่สำเร็จ',
      googleConfigError:
        'Google Sign-In ยังไม่พร้อมใช้งานสำหรับโดเมนนี้ โปรดตรวจสอบ Google Client ID และ Authorized JavaScript Origins',
      googleBackendConfigError:
        'เซิร์ฟเวอร์ยังตั้งค่า Google Sign-In ไม่ถูกต้อง โปรดตรวจสอบ Google Client ID ฝั่ง backend',
      googleInvalidTokenError:
        'Google ส่ง token สำหรับการเข้าสู่ระบบมาไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง หากยังเกิดปัญหาให้ตรวจสอบการตั้งค่า Google client',
    },
    header: {
      notifications: 'การแจ้งเตือน',
      markAllRead: 'อ่านทั้งหมด',
      noNotifications: 'ยังไม่มีการแจ้งเตือนใหม่',
    },
    sidebar: {
      navigation: 'เมนูนำทาง',
      search: 'ค้นหา',
      noResults: 'ไม่พบรายการที่ตรงกัน',
      expandSidebar: 'ขยายแถบด้านข้าง',
      collapseSidebar: 'ย่อแถบด้านข้าง',
      sections: {
        overview: 'ภาพรวม',
        developer: 'เครื่องมือพัฒนา',
        support: 'การสนับสนุน',
      },
      items: {
        overview: 'ภาพรวม',
        usage: 'การใช้งาน',
        logs: 'บันทึกคำขอ',
        apiKeys: 'คีย์ API',
        models: 'โมเดล',
        integrations: 'การเชื่อมต่อ',
        status: 'สถานะระบบ',
        community: 'ชุมชน',
        manageUsers: 'จัดการผู้ใช้',
      },
      user: 'ผู้ใช้',
      administrator: 'ผู้ดูแลระบบ',
      standardUser: 'ผู้ใช้ทั่วไป',
      logout: 'ออกจากระบบ',
    },
  },
};
