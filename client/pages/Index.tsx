import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Zap,
  Lock,
  Briefcase,
  BarChart3,
  Users,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

const FeatureIcon = ({ icon: Icon }: { icon: React.ReactNode }) => <>{Icon}</>;

export default function Index() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-accent" />,
      title: "Мгновенные ответы",
      description:
        "Получайте юридическую консультацию за секунды, доступно 24/7 для всех ваших вопросов.",
    },
    {
      icon: <Lock className="w-6 h-6 text-accent" />,
      title: "Конфиденциально и безопасно",
      description:
        "Шифрование корпоративного уровня гарантирует конфиденциальность ваших данных и переписки.",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-accent" />,
      title: "Юридическая экспертиза",
      description:
        "Обучено на обширных юридических базах данных и судебной практике для точных рекомендаций.",
    },
    {
      icon: <Briefcase className="w-6 h-6 text-accent" />,
      title: "Профессиональный",
      description: "Подходит для частных лиц, малых и крупных предприятий.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-accent" />,
      title: "Анализ документов",
      description:
        "Загружайте контракты и документы для интеллектуального анализа и выводов.",
    },
    {
      icon: <Users className="w-6 h-6 text-accent" />,
      title: "Мультиюрисдикция",
      description:
        "Охватывает различные правовые системы и юрисдикции по всему миру.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Задайте вопрос",
      description:
        "Введите ваш юридический вопрос на понятном языке, с необходимыми деталями.",
    },
    {
      number: "2",
      title: "Анализ ИИ",
      description:
        "Наш продвинутый ИИ анализирует ваш вопрос с учетом правовых норм и судебной практики.",
    },
    {
      number: "3",
      title: "Получите рекомендации",
      description:
        "Получайте полную, действенную юридическую консультацию и рекомендации.",
    },
    {
      number: "4",
      title: "Принимайте меры",
      description:
        "Экспортируйте документы, поделитесь с адвокатом или действуйте с уверенностью.",
    },
  ];

  const plans = [
    {
      name: "Стартер",
      subtitle: "Идеально для частных лиц",
      price: "₽699",
      period: "/месяц",
      cta: "Начать",
      features: [
        "До 20 консультаций/месяц",
        "Базовые юридические шаблоны",
        "Поддержка по электронной почте",
        "Стандартное время отклика",
      ],
    },
    {
      name: "Профессиональный",
      subtitle: "Для растущих компаний",
      price: "₽2990",
      period: "/месяц",
      cta: "Начать бесплатный период",
      featured: true,
      features: [
        "Неограниченные консультации",
        "Продвинутый анализ документов",
        "Приоритетная поддержка",
        "Пользовательские шаблоны",
        "Командное сотрудничество",
      ],
    },
  ];
  

  const faqs = [
    {
      question:
        "Может ли совет ИИ быть таким же хорошим, как у реального адвоката?",
      answer:
        "PravoAI предоставляет быструю и точную информацию для большинства вопросов. Однако для критических решений рекомендуется проконсультироваться с квалифицированным адвокатом.",
    },
    {
      question: "Как защищены мои данные?",
      answer:
        "Мы используем шифрование корпоративного уровня (256-бит AES) и соответствуем международным стандартам безопасности GDPR и ISO 27001.",
    },
    {
      question: "Какие юрисдикции охватываются?",
      answer:
        "PravoAI охватывает правовые системы более 100 стран, включая России, США, ЕС и другие основные юрисдикции.",
    },
    {
      question: "Могу ли я скачать мои консультации?",
      answer:
        "Да, вы можете экспортировать все консультации в PDF, Word или другие форматы для архивирования и обмена с адвокатом.",
    },
    {
      question: "Что если мне нужна поддержка человека?",
      answer:
        "Все планы включают поддержку. Профессиональный план предоставляет приоритетную поддержку.",
    },
    {
      question: "Могу ли я интегрировать это с моими системами?",
      answer:
        "Да, наш API позволяет легко интегрировать PravoAI с вашими системами управления или рабочими процессами.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
              Профессиональная юридическая консультация, работающая на ИИ
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 mt-14 leading-relaxed">
              Получайте мгновенную и точную юридическую консультацию для любой
              ситуации. Доступно 24/7, безопасно и надежно для тысяч
              профессионалов по всему миру.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-20">
              <Link
                to="/auth"
                className="px-8 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity text-center"
              >
                Начните бесплатную консультацию
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mx-auto max-w-6xl px-4 md:px-8 py-10 md:py-12">
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-accent mb-2">
                50K+
              </p>
              <p className="text-lg text-muted-foreground">
                Активных пользователей
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-accent mb-2">
                1M+
              </p>
              <p className="text-lg text-muted-foreground">Консультаций</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-accent mb-2">
                99.9%
              </p>
              <p className="text-lg text-muted-foreground">Доступность</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16"
        >
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Мощные возможности
            </h2>
            <p className="text-lg text-muted-foreground">
              Всё необходимое для профессиональной юридической консультации
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-card border border-border hover:border-accent transition-colors"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Как это работает
            </h2>
            <p className="text-lg text-muted-foreground">
              Простая, быстрая и эффективная юридическая консультация за 4 шага
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 -right-12 w-24 h-0.5 bg-border"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16"
        >
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Прозрачные цены
            </h2>
            <p className="text-lg text-muted-foreground">
              Выберите план, который подходит вашим потребностям
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg border p-8 flex flex-col ${
                  plan.featured
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-card-foreground border-border"
                }`}
              >
                <h3
                  className={`text-2xl font-bold mb-1 ${plan.featured ? "text-accent-foreground" : "text-foreground"}`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-6 ${plan.featured ? "text-accent-foreground/80" : "text-muted-foreground"}`}
                >
                  {plan.subtitle}
                </p>
                <div className="mb-6">
                  <p
                    className={`text-3xl font-bold ${plan.featured ? "text-accent-foreground" : "text-foreground"}`}
                  >
                    {plan.price}
                  </p>
                  {plan.period && (
                    <p
                      className={`text-sm ${plan.featured ? "text-accent-foreground/80" : "text-muted-foreground"}`}
                    >
                      {plan.period}
                    </p>
                  )}
                </div>
                <button
                  className={`w-full py-2 rounded-lg font-semibold mb-8 transition-opacity hover:opacity-90 ${
                    plan.featured
                      ? "bg-white text-accent"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  {plan.cta}
                </button>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className={`flex items-start gap-2 text-sm ${plan.featured ? "text-accent-foreground" : "text-foreground"}`}
                    >
                      <span className="text-lg">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq"
          className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16"
        >
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Часто задаваемые вопросы
            </h2>
            <p className="text-lg text-muted-foreground">
              Всё, что вам нужно знать о PravoAI
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden bg-card"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary transition-colors"
                >
                  <span className="font-semibold text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-accent transition-transform duration-300 flex-shrink-0 ${
                      expandedFaq === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedFaq === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-muted-foreground border-t border-border pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
