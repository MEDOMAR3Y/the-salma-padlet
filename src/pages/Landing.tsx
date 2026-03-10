import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Layout, Users, Share2, Palette, Zap, Shield, Sparkles, Star, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logo from '@/assets/logo.png';

const features = [
  { icon: Layout, title: 'لوحات مرنة', desc: 'أنشئ لوحات بتخطيطات متعددة — حائط، شبكة، أو أعمدة — تناسب طريقة تفكيرك', color: 'from-violet-500 to-indigo-600' },
  { icon: Users, title: 'تعاون لحظي', desc: 'ادعو فريقك وشاركهم اللوحة بصلاحيات مختلفة في الوقت الحقيقي', color: 'from-blue-500 to-cyan-500' },
  { icon: Share2, title: 'مشاركة فورية', desc: 'شارك أي لوحة برابط مباشر أو ادعو مستخدمين بالاسم أو الإيميل', color: 'from-emerald-500 to-teal-500' },
  { icon: Palette, title: 'تخصيص بلا حدود', desc: 'ألوان، خلفيات، صور — صمم كل لوحة وبوست بأسلوبك الخاص', color: 'from-orange-500 to-rose-500' },
  { icon: Zap, title: 'محتوى غني', desc: 'نصوص منسقة، صور، فيديوهات، روابط، وملفات — كل شيء في مكان واحد', color: 'from-amber-500 to-yellow-500' },
  { icon: Shield, title: 'خصوصية متقدمة', desc: 'تحكم دقيق في صلاحيات القراءة والكتابة وحظر المستخدمين', color: 'from-pink-500 to-rose-500' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

const stats = [
  { value: '∞', label: 'لوحات غير محدودة' },
  { value: '6+', label: 'أنواع محتوى' },
  { value: '100%', label: 'مجاني بالكامل' },
];

const steps = [
  { step: '01', title: 'أنشئ حسابك', desc: 'سجّل مجاناً في ثوانٍ وابدأ فوراً بدون أي تعقيد', gradient: 'from-primary to-purple-500' },
  { step: '02', title: 'أنشئ لوحة', desc: 'اختر التخطيط، الألوان، والخلفية المناسبة لمشروعك', gradient: 'from-blue-500 to-cyan-500' },
  { step: '03', title: 'أضف محتوى', desc: 'أضف نصوص منسقة، صور، فيديوهات، روابط، وملفات', gradient: 'from-emerald-500 to-teal-500' },
  { step: '04', title: 'شارك وتعاون', desc: 'ادعو فريقك بالرابط أو الإيميل وابدأوا العمل سوا', gradient: 'from-orange-500 to-rose-500' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="shrink-0">
            <img src={logo} alt="The Salma Padlet" className="h-12 sm:h-14 object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <button onClick={() => navigate('/profile')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar className="h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-sm"><Link to="/auth/login">تسجيل دخول</Link></Button>
                <Button asChild size="sm" className="rounded-xl"><Link to="/auth/signup">ابدأ مجاناً</Link></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 relative min-h-[92vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.15, 0.9, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-10 sm:top-20 right-[5%] sm:right-[10%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-primary/10 blur-[80px] sm:blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -30, 20, 0], y: [0, 30, -30, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-10 left-[5%] sm:left-[15%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-accent/10 blur-[100px] sm:blur-[140px]"
          />
          <motion.div
            animate={{ x: [0, 20, -10, 0], y: [0, -20, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-purple-500/8 blur-[80px] sm:blur-[100px]"
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto text-center relative z-10 max-w-5xl">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 sm:mb-8"
          >
            <img src={logo} alt="The Salma Padlet" className="h-28 sm:h-44 md:h-56 mx-auto object-contain drop-shadow-2xl" />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium mb-6 sm:mb-8"
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            منصة لوحات تعاونية حديثة
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-5xl md:text-7xl font-bold font-['Space_Grotesk'] leading-[1.15] mb-5 sm:mb-8 px-2"
          >
            نظّم أفكارك{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite]">
              بأسلوب بصري جذاب
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
          >
            أنشئ لوحات تفاعلية، شارك أفكارك مع فريقك، ونظّم محتواك بطريقة بصرية سهلة ومرنة
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
          >
            {user ? (
              <Button size="lg" asChild className="text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Link to="/profile">
                  لوحاتي
                  <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Link to="/auth/signup">
                    ابدأ مجاناً
                    <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 rounded-2xl border-border/60">
                  <Link to="/auth/login">تسجيل دخول</Link>
                </Button>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex justify-center gap-6 sm:gap-12 md:gap-16 mt-12 sm:mt-16"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.1, type: 'spring', stiffness: 200 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Space_Grotesk'] text-primary">{s.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 sm:mt-16 hidden sm:flex justify-center"
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-muted-foreground/40">
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Preview mockup */}
      <section className="px-4 pb-16 sm:pb-20 -mt-6 sm:-mt-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="container mx-auto max-w-5xl"
        >
          <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-card/40 backdrop-blur-sm p-2 sm:p-3 shadow-2xl shadow-primary/5">
            <div className="rounded-xl sm:rounded-2xl bg-card overflow-hidden border border-border/40">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/40 bg-muted/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-destructive/50" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400/50" />
                </div>
                <div className="flex-1 mx-4 sm:mx-8">
                  <div className="h-5 sm:h-6 rounded-lg bg-muted/40 max-w-[200px] sm:max-w-xs mx-auto" />
                </div>
              </div>
              <div className="p-3 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { h: 'h-20 sm:h-28', bg: 'bg-violet-500/15' },
                  { h: 'h-28 sm:h-36', bg: 'bg-blue-500/15' },
                  { h: 'h-16 sm:h-24', bg: 'bg-emerald-500/15' },
                  { h: 'h-24 sm:h-32', bg: 'bg-orange-500/15' },
                  { h: 'h-32 sm:h-40', bg: 'bg-pink-500/15' },
                  { h: 'h-20 sm:h-28', bg: 'bg-cyan-500/15' },
                  { h: 'h-28 sm:h-36', bg: 'bg-amber-500/15' },
                  { h: 'h-16 sm:h-24', bg: 'bg-rose-500/15' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    className={`${item.h} ${item.bg} rounded-lg sm:rounded-xl border border-border/20`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-16 px-2">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-['Space_Grotesk'] mb-3 sm:mb-4">كل اللي تحتاجه في مكان واحد</h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">أدوات قوية ومرنة لتنظيم أفكارك ومشاركتها مع فريقك بسهولة</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-5 sm:p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 sm:mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 font-['Space_Grotesk']">{f.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl sm:text-4xl font-bold text-center mb-10 sm:mb-16 font-['Space_Grotesk']">
            كيف تبدأ؟
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative p-5 sm:p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/20 transition-all group"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${item.gradient} mb-3 sm:mb-4`}>
                  <span className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-white">{item.step}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] mb-1.5">{item.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-8 sm:p-12 md:p-16 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/60 rounded-[1.5rem] sm:rounded-[2rem]" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative z-10">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="inline-block mb-4 sm:mb-6">
                <Star className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 font-['Space_Grotesk']">جاهز تبدأ؟</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">أنشئ حسابك مجاناً وابدأ في تنظيم أفكارك بطريقة بصرية</p>
              <Button size="lg" asChild className="text-base sm:text-lg px-8 sm:px-12 h-12 sm:h-14 rounded-2xl shadow-lg shadow-primary/25">
                <Link to={user ? '/profile' : '/auth/signup'}>{user ? 'لوحاتي' : 'أنشئ حسابك الآن'}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-border/40">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 The Salma Padlet. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
