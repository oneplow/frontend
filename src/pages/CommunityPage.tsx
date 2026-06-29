import { Link } from 'react-router-dom';
import {
  ChevronRight,
  MessageCircle,
  GitBranch,
  BookOpen,
  Zap,
  Globe,
  Heart,
  ExternalLink,
  Star,
  ArrowUpRight,
  Users,
  Code2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';

export const CommunityPage = () => {
  const { language } = useAppSettings();

  const copy =
    language === 'th'
      ? {
        overview: 'ภาพรวม',
        title: 'ชุมชน',
        description: 'เชื่อมต่อกับนักพัฒนาคนอื่น แชร์ไอเดีย และเข้าถึงแหล่งข้อมูลต่างๆ',
        heroTitle: 'เข้าร่วมชุมชนนักพัฒนาของเรา',
        heroDescription:
          'เชื่อมต่อกับนักพัฒนาหลายพันคนที่กำลังสร้างแอปพลิเคชัน AI สุดล้ำ แชร์ความรู้ ถามคำถาม และร่วมสร้างอนาคตของ AI ไปด้วยกัน',
        joinCommunity: 'เข้าร่วมชุมชน',
        platformsTitle: 'แพลตฟอร์มชุมชน',
        platformsDescription: 'พูดคุยและแลกเปลี่ยนความรู้กับนักพัฒนาคนอื่นๆ',
        resourcesTitle: 'แหล่งข้อมูล',
        resourcesDescription: 'เอกสาร คู่มือ และตัวอย่างโค้ดสำหรับการเริ่มต้นใช้งาน',
        contributorsTitle: 'มีส่วนร่วม',
        contributorsDescription: 'ร่วมเป็นส่วนหนึ่งของโปรเจกต์ที่กำลังเติบโต',
        platforms: {
          discord: {
            title: 'Discord',
            description: 'แชทสดกับชุมชนนักพัฒนา ถามคำถาม และรับความช่วยเหลือแบบเรียลไทม์',
            members: 'สมาชิกออนไลน์',
            join: 'เข้าร่วม Discord',
          },
          github: {
            title: 'GitHub',
            description: 'มีส่วนร่วมในโค้ด รายงานปัญหา และเสนอฟีเจอร์ใหม่ๆ',
            stars: 'ดาว',
            view: 'ดูโปรเจกต์',
          },
          twitter: {
            title: 'Twitter / X',
            description: 'ติดตามข่าวสารอัปเดต เทรนด์ AI และการประกาศใหม่ล่าสุด',
            followers: 'ผู้ติดตาม',
            follow: 'ติดตาม',
          },
        },
        resources: {
          docs: {
            title: 'เอกสาร API',
            description: 'คู่มือครบถ้วนสำหรับการใช้งาน API ทุกฟีเจอร์',
          },
          quickstart: {
            title: 'เริ่มต้นอย่างรวดเร็ว',
            description: 'ตัวอย่างโค้ดเพื่อเริ่มต้นใช้งาน API ภายใน 5 นาที',
          },
          examples: {
            title: 'ตัวอย่างโค้ด',
            description: 'ดูตัวอย่างโปรเจกต์จริงที่สร้างด้วย API ของเรา',
          },
          faq: {
            title: 'คำถามที่พบบ่อย',
            description: 'คำตอบสำหรับคำถามที่นักพัฒนาถามบ่อยที่สุด',
          },
        },
        contribute: {
          title: 'ร่วมพัฒนากับเรา',
          description:
            'โปรเจกต์ของเราเป็นโอเพนซอร์สและเปิดรับการมีส่วนร่วมจากทุกคน ไม่ว่าจะเป็นการแก้ไขบัค เพิ่มฟีเจอร์ หรือปรับปรุงเอกสาร',
          cta: 'ดูบน GitHub',
          stats: {
            contributors: 'ผู้ร่วมพัฒนา',
            commits: 'คอมมิท',
            releases: 'เวอร์ชัน',
          },
        },
      }
      : {
        overview: 'Overview',
        title: 'Community',
        description: 'Connect with other developers, share ideas, and access resources.',
        heroTitle: 'Join our Developer Community',
        heroDescription:
          'Connect with thousands of developers building cutting-edge AI applications. Share knowledge, ask questions, and shape the future of AI together.',
        joinCommunity: 'Join Community',
        platformsTitle: 'Community Platforms',
        platformsDescription: 'Chat, discuss, and share knowledge with other developers.',
        resourcesTitle: 'Resources',
        resourcesDescription: 'Documentation, guides, and code examples to get started.',
        contributorsTitle: 'Contribute',
        contributorsDescription: 'Be part of a growing open-source project.',
        platforms: {
          discord: {
            title: 'Discord',
            description: 'Live chat with the developer community. Ask questions and get real-time help.',
            members: 'members online',
            join: 'Join Discord',
          },
          github: {
            title: 'GitHub',
            description: 'Contribute code, report issues, and suggest new features.',
            stars: 'stars',
            view: 'View Project',
          },
          twitter: {
            title: 'Twitter / X',
            description: 'Follow the latest updates, AI trends, and announcements.',
            followers: 'followers',
            follow: 'Follow',
          },
        },
        resources: {
          docs: {
            title: 'API Documentation',
            description: 'Comprehensive guide for using every API feature.',
          },
          quickstart: {
            title: 'Quick Start',
            description: 'Code samples to get started with the API in 5 minutes.',
          },
          examples: {
            title: 'Code Examples',
            description: 'Real-world project examples built with our API.',
          },
          faq: {
            title: 'FAQ',
            description: 'Answers to the most commonly asked developer questions.',
          },
        },
        contribute: {
          title: 'Contribute to the Project',
          description:
            'Our project is open source and welcomes contributions from everyone. Whether it\'s fixing bugs, adding features, or improving docs.',
          cta: 'View on GitHub',
          stats: {
            contributors: 'Contributors',
            commits: 'Commits',
            releases: 'Releases',
          },
        },
      };

  return (
    <div className="mx-auto w-full max-w-[1800px] p-4 lg:p-6 pb-20">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-[15px] font-medium app-muted">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-500 hover:underline transition-colors">
          {copy.overview}
        </Link>
        <ChevronRight size={14} className="mx-2 opacity-50" />
        <span className="app-text">{copy.title}</span>
      </div>

      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight app-text">{copy.title}</h1>
        <p className="text-sm app-muted">{copy.description}</p>
      </div>

      {/* Hero Banner */}
      <div
        className="relative mb-8 overflow-hidden rounded-2xl p-8 md:p-10"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #ec4899 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Heart size={12} />
            Open Source
          </div>
          <h2 className="mb-3 text-2xl md:text-3xl font-bold text-white leading-tight">
            {copy.heroTitle}
          </h2>
          <p className="mb-6 text-sm md:text-base text-white/80 leading-relaxed">
            {copy.heroDescription}
          </p>
          <a
            href="#platforms"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
          >
            {copy.joinCommunity}
            <ArrowUpRight size={16} />
          </a>
        </div>
        {/* Decorative floating shapes */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-12 right-16 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute right-1/4 top-4 h-20 w-20 rounded-full bg-pink-300/20 blur-lg" />
      </div>

      {/* Community Platforms */}
      <div id="platforms" className="mb-10">
        <div className="mb-5">
          <h2 className="text-xl font-bold app-text">{copy.platformsTitle}</h2>
          <p className="mt-1 text-sm app-muted">{copy.platformsDescription}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Discord */}
          <div
            className="group relative overflow-hidden rounded-2xl p-6 transition-all hover:shadow-lg cursor-pointer"
            style={{
              background: 'var(--app-surface)',
              border: '1px solid var(--app-border)',
            }}
          >
            <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.06) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: '#5865F2' }}>
                  <MessageCircle size={22} className="text-white" />
                </div>
                <ExternalLink size={16} className="app-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1.5 text-lg font-bold app-text">{copy.platforms.discord.title}</h3>
              <p className="mb-4 text-sm app-muted leading-relaxed">{copy.platforms.discord.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-medium text-emerald-600">2.4k {copy.platforms.discord.members}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#5865F2] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#4752c4]">
                  {copy.platforms.discord.join}
                </span>
              </div>
            </div>
          </div>

          {/* GitHub */}
          <div
            className="group relative overflow-hidden rounded-2xl p-6 transition-all hover:shadow-lg cursor-pointer"
            style={{
              background: 'var(--app-surface)',
              border: '1px solid var(--app-border)',
            }}
          >
            <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(36, 41, 47, 0.06) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-700">
                  <GitBranch size={22} className="text-white" />
                </div>
                <ExternalLink size={16} className="app-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1.5 text-lg font-bold app-text">{copy.platforms.github.title}</h3>
              <p className="mb-4 text-sm app-muted leading-relaxed">{copy.platforms.github.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium app-muted">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span>1.2k {copy.platforms.github.stars}</span>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                  style={{
                    backgroundColor: 'var(--app-surface-muted)',
                    color: 'var(--app-text)',
                    border: '1px solid var(--app-border)',
                  }}
                >
                  {copy.platforms.github.view}
                </span>
              </div>
            </div>
          </div>

          {/* Twitter */}
          <div
            className="group relative overflow-hidden rounded-2xl p-6 transition-all hover:shadow-lg cursor-pointer"
            style={{
              background: 'var(--app-surface)',
              border: '1px solid var(--app-border)',
            }}
          >
            <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(29, 155, 240, 0.06) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black">
                  <Globe size={22} className="text-white" />
                </div>
                <ExternalLink size={16} className="app-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1.5 text-lg font-bold app-text">{copy.platforms.twitter.title}</h3>
              <p className="mb-4 text-sm app-muted leading-relaxed">{copy.platforms.twitter.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium app-muted">
                  <Users size={14} />
                  <span>5.8k {copy.platforms.twitter.followers}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-zinc-800">
                  {copy.platforms.twitter.follow}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="mb-10">
        <div className="mb-5">
          <h2 className="text-xl font-bold app-text">{copy.resourcesTitle}</h2>
          <p className="mt-1 text-sm app-muted">{copy.resourcesDescription}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', ...copy.resources.docs },
            { icon: Zap, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', ...copy.resources.quickstart },
            { icon: Code2, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', ...copy.resources.examples },
            { icon: HelpCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', ...copy.resources.faq },
          ].map((resource) => {
            const Icon = resource.icon;
            return (
              <div
                key={resource.title}
                className="group flex flex-col rounded-2xl p-5 transition-all hover:shadow-md cursor-pointer"
                style={{
                  background: 'var(--app-surface)',
                  border: '1px solid var(--app-border)',
                }}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: resource.bg }}
                >
                  <Icon size={18} style={{ color: resource.color }} />
                </div>
                <h3 className="mb-1 text-sm font-bold app-text">{resource.title}</h3>
                <p className="text-xs app-muted leading-relaxed flex-1">{resource.description}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600">
                  <FileText size={12} />
                  <span className="group-hover:underline">{language === 'th' ? 'อ่านเพิ่มเติม' : 'Read more'}</span>
                  <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contribute CTA */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
        }}
      >
        <div className="flex flex-col md:flex-row items-center gap-8 p-8">
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-bold app-text">{copy.contribute.title}</h2>
            <p className="mb-5 text-sm app-muted leading-relaxed">{copy.contribute.description}</p>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)' }}
            >
              <GitBranch size={16} />
              {copy.contribute.cta}
              <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="flex gap-6 md:gap-8 shrink-0">
            {[
              { value: '42', label: copy.contribute.stats.contributors, color: '#3b82f6' },
              { value: '1.8k', label: copy.contribute.stats.commits, color: '#8b5cf6' },
              { value: '24', label: copy.contribute.stats.releases, color: '#10b981' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="mt-0.5 text-xs font-medium app-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
