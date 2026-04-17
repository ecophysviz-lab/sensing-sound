import { Link } from "react-router";
import { Users, Waves, Ship, AlertCircle } from "lucide-react";
import LanguageToggle from "../components/LanguageToggle";
import kelpForestImage from "@/assets/466eeefa090642bc63ad30b19adb04bdeebda888.png";
import logoImage from "@/assets/9962ff5db39642ae80b1efdc857274dd2ff0055a.png";
import harborSealImage from "@/assets/ae6420e7e13fdb75fda431bbe0983f9edfff3ba0.png";
import noaaLogo from "@/assets/NOAA_Logo_10x.png";
import packardLogo from "@/assets/PackardFoundation_Logo_10x.png";
import ucscScienceLogo from "@/assets/UCSC_Logo_10x.png";
import { usePanelCopy } from "../hooks/useSheetCopy";

const PROJECT_FALLBACK = {
  Title: "About the Project",
  "Body 1":
    "Sound is essential to marine mammals. They use it to find mates, care for their young, stay connected, and locate food. But sound doesn't travel forever from its source\u2014a particular sound can only be heard over a certain distance. Scientists call the area over which an animal can detect important signals an animal's \"listening space.\" The size of this space depends on the type of sound, the ocean conditions (like temperature, salinity, and bathymetry), and the hearing capabilities of the listener. Background noise is also important - it can make target sounds harder for listeners to detect. Researchers from UC Santa Cruz, Monterey Bay Aquarium Research Institute, and Middlebury Institute collaborated to study how changes in underwater noise affect this dynamic listening space for different local marine mammal species.",
  "Body 2 - emphasized text":
    "How is an animal's ability to hear important sounds affected by background noise?",
  "Body 3":
    "This project brings acoustics research into an interactive format, allowing users to compare how listening space changes as noise conditions vary from calm, quiet seas to the presence of loud vessel noise.",
};

const EXPERIENCE_FALLBACK = {
  Title: "About the Experience",
  "Body 1":
    "Listen to Monterey Bay from a marine animal's perspective and test how an animal's ability to detect a sound changes under different noise conditions.",
  "Body 2":
    "Harbor seals, bottlenose dolphins, and killer whales all depend on acoustic cues, but the sounds they listen for, their hearing sensitivity, and their sound production differ.",
  "Body - emphasized central question":
    "The central question is how listening space changes as background noise gets quieter or louder.",
};

const SCIENCE_FALLBACK = {
  Title: "About the Science",
  "Body 1":
    "We estimated the listening space of different sounds under varying noise conditions by integrating four variables: 1) published source levels for species-specific calls (e.g., how loud is a rockfish grunt?), 2) a very simple acoustic propagation model (with a spreading estimate halfway between spherical and cylindrical spreading, not accounting for bathymetry), 3) measurements of ocean noise at different times of year taken from NOAA's SanctSound Program, and 4) carefully collected auditory data from the species of interest that characterize how well each species hears in quiet conditions (sensitivity data) and in the presence of noise (critical ratio data). Focal species included harbor seals, bottlenose dolphins, and killer whales, all of which are present in the Monterey Bay National Marine Sanctuary.",
  "Body 2 - math equation": "DT = SL - 15log(r) - ar",
  "Body 3 - math equation description":
    "DT is detection threshold in context, SL is a vocalization's source level, r is listening range, and a is frequency-dependent seawater absorption.",
  "Body 4 - Text":
    "In accessible terms: a call is loudest at its source, then becomes quieter as it spreads out until it falls below what a listener can detect in local noise.",
  "Body 5 - box Title": "Relative vs. absolute range display",
  "Body 5 - box Description":
    "Although listening ranges were calculated in absolute terms, these values are estimates and do not include all factors affecting sound propagation. The most relevant outcome of this analysis is the relative change in listening range for an animal trying to hear important sounds under different environmental conditions. Simply, listening range decreases as background noise increases, and results highlight relative changes in listening space for marine mammals across different acoustic environments.",
};

function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 animate-pulse">
      <div className="h-8 bg-white/20 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="h-4 bg-white/10 rounded"
            style={{ width: `${100 - i * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function AboutTheProject() {
  const { copy, isLoading } = usePanelCopy("About the Project");
  const t = (key: string) =>
    copy[key] || PROJECT_FALLBACK[key as keyof typeof PROJECT_FALLBACK] || "";

  if (isLoading) return <SectionSkeleton />;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-bold text-white">{t("Title")}</h2>
      </div>
      <div className="text-white/90 space-y-4 leading-relaxed">
        <p>{t("Body 1")}</p>
        <p className="italic text-orange-300 text-lg">
          {t("Body 2 - emphasized text")}
        </p>
        <p>{t("Body 3")}</p>
      </div>
    </div>
  );
}

function AboutTheExperience() {
  const { copy, isLoading } = usePanelCopy("About the Experience");
  const t = (key: string) =>
    copy[key] || EXPERIENCE_FALLBACK[key as keyof typeof EXPERIENCE_FALLBACK] || "";

  if (isLoading) return <SectionSkeleton />;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <Waves className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-bold text-white">{t("Title")}</h2>
      </div>
      <div className="text-white/90 space-y-4 leading-relaxed">
        <p>{t("Body 1")}</p>
        <p>{t("Body 2")}</p>
        <p className="text-orange-400">
          {t("Body - emphasized central question")}
        </p>
      </div>
    </div>
  );
}

function AboutTheScience() {
  const { copy, isLoading } = usePanelCopy("About the Science");
  const t = (key: string) =>
    copy[key] || SCIENCE_FALLBACK[key as keyof typeof SCIENCE_FALLBACK] || "";

  if (isLoading) return <SectionSkeleton lines={4} />;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-bold text-white">{t("Title")}</h2>
      </div>
      <div className="text-white/90 space-y-4 leading-relaxed">
        <p>{t("Body 1")}</p>
        <div className="bg-black/20 border border-white/20 rounded-lg p-4 text-center">
          <p className="text-lg text-orange-300 font-mono">
            {t("Body 2 - math equation")}
          </p>
          <p className="text-sm text-white/80 mt-2">
            {t("Body 3 - math equation description")}
          </p>
        </div>
        <p>{t("Body 4 - Text")}</p>
        <div className="bg-orange-400/15 border border-orange-300/50 rounded-lg p-4">
          <p className="text-orange-300 font-semibold mb-2">
            {t("Body 5 - box Title")}
          </p>
          <p className="text-sm">{t("Body 5 - box Description")}</p>
        </div>
      </div>
    </div>
  );
}

const IMPACT_FALLBACK = {
  Title: "The Impact of Human Noise",
  "Body 1":
    "Human activities such as shipping and cruise traffic introduce persistent underwater sound that can reduce communication and detection distances.",
  "Emphasis line":
    "Compare calm and vessel contexts to evaluate relative masking effects.",
  "Body 2":
    "These comparisons help show how natural and anthropogenic noise can alter communication space and habitat quality.",
};

function ImpactOfHumanNoise() {
  const { copy, isLoading } = usePanelCopy("The Impact of Human Noise");
  const t = (key: string) =>
    copy[key] || IMPACT_FALLBACK[key as keyof typeof IMPACT_FALLBACK] || "";

  if (isLoading) return <SectionSkeleton />;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <Ship className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-bold text-white">{t("Title")}</h2>
      </div>
      <div className="text-white/90 space-y-4 leading-relaxed">
        <p>{t("Body 1")}</p>
        <p className="italic text-orange-300 text-lg">{t("Emphasis line")}</p>
        <p>{t("Body 2")}</p>
      </div>
    </div>
  );
}

const HOW_TO_EXPLORE_FALLBACK = {
  Title: "How to Explore",
  "Step 1":
    "Choose your context: Compare calm, wind and waves, storms, and vessel noise.",
  "Step 2":
    "Pick your listener: Switch among harbor seal, bottlenose dolphin, and killer whale.",
  "Step 3":
    "Select a sound source: Test fish and marine mammal sounds across listeners.",
  "Step 4":
    "Observe results: Focus on relative range changes as noise conditions shift.",
};

function HowToExplore() {
  const { copy, isLoading } = usePanelCopy("How to Explore");
  const t = (key: string) =>
    copy[key] ||
    HOW_TO_EXPLORE_FALLBACK[key as keyof typeof HOW_TO_EXPLORE_FALLBACK] ||
    "";

  if (isLoading) return <SectionSkeleton lines={4} />;

  const steps = ["Step 1", "Step 2", "Step 3", "Step 4"] as const;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-4">{t("Title")}</h2>
      <div className="text-white/90 space-y-3">
        {steps.map((stepKey, i) => (
          <div key={stepKey} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0 text-white font-bold">
              {i + 1}
            </div>
            <p>{t(stepKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const FUNDERS_FALLBACK = {
  Title: "Funders",
  Description:
    "Funding support from the Packard Foundation and UC Santa Cruz Science.",
};

const FOOTER_FALLBACK = {
  Copyright: "\u00a9 2026 SensingSound Project",
  "Collaboration line":
    "A collaboration between UC Santa Cruz, Monterey Bay Aquarium Research Institute, NOAA and the Middlebury Institute",
  "Credit 1": "Website designed by Jessica Kendall-Bar.",
  "Credit 2":
    "Interactive exhibit at Seymour Marine Discovery Center designed by Ian Costello and Jessica Kendall-Bar.",
};

function Funders() {
  const { copy } = usePanelCopy("Funders");
  const t = (key: string) =>
    copy[key] || FUNDERS_FALLBACK[key as keyof typeof FUNDERS_FALLBACK] || "";

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-4">{t("Title")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 h-full flex items-center justify-center">
          <img src={noaaLogo} alt="NOAA" className="max-h-24 w-auto object-contain" />
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 h-full flex items-center justify-center">
          <img src={packardLogo} alt="Packard Foundation" className="max-h-24 w-auto object-contain" />
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 h-full flex items-center justify-center">
          <img src={ucscScienceLogo} alt="UC Santa Cruz Science" className="max-h-24 w-auto object-contain" />
        </div>
      </div>
      <p className="mt-4 text-sm text-white/80">{t("Description")}</p>
    </div>
  );
}

function Footer() {
  const { copy } = usePanelCopy("Footer");
  const t = (key: string) =>
    copy[key] || FOOTER_FALLBACK[key as keyof typeof FOOTER_FALLBACK] || "";

  return (
    <div className="mt-12 text-center text-white/60 text-sm">
      <p>{t("Copyright")}</p>
      <p className="mt-2">{t("Collaboration line")}</p>
      <p className="mt-4">{t("Credit 1")}</p>
      <p className="mt-1">{t("Credit 2")}</p>
    </div>
  );
}

export default function About() {
  const { copy: heroCopy } = usePanelCopy("About Hero");
  const { copy: projectCopy } = usePanelCopy("About the Project");

  return (
    <div className="relative w-full min-h-screen overflow-auto">
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{
          backgroundImage: `url(${kelpForestImage})`,
        }}
      />

      <div className="fixed inset-0 bg-teal-900/80 backdrop-blur-sm -z-10" />

      <div className="fixed top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img src={logoImage} alt="SensingSound" className="h-20 w-auto" />
          </div>
          <p className="text-xl text-white/90 italic">
            {heroCopy["Subtitle"] || "Exploring Underwater Sound in Monterey Bay"}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 mt-6 mx-auto px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-colors"
          >
            {heroCopy["Explore CTA"] || "Explore"}
          </Link>
        </div>

        <div className="space-y-6">
          <AboutTheProject />

          <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col items-center">
              <img
                src={harborSealImage}
                alt={projectCopy["Sprouts caption"] || "Sprouts the harbor seal"}
                className="w-52 h-52 rounded-full object-cover border-4 border-cyan-300/70 shadow-xl"
              />
              <p className="mt-3 text-white/90 text-sm italic">
                {projectCopy["Sprouts caption"] || "Sprouts the harbor seal"}
              </p>
            </div>
            <div className="absolute bottom-2 right-3 text-[11px] tracking-widest text-white/30">
              NMFS 23554
            </div>
          </div>

          <AboutTheExperience />

          <AboutTheScience />

          <ImpactOfHumanNoise />

          <HowToExplore />

          <Funders />
        </div>

        <Footer />
      </div>
    </div>
  );
}
