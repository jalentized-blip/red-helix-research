import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, AlertTriangle, TrendingDown, Globe, Factory, DollarSign, Users, Shield, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function GrayMarketInsights() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (err) {
        navigate(createPageUrl('Home'));
        return;
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-32 flex items-center justify-center">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const chineseSuppliers = [
    { name: "QSC (Qingdao Sigma Chemical Co.)", reputation: "High", priceRange: "$50-150/kit", platforms: "Telegram, WhatsApp", notes: "Most popular. Community-tested COAs.", contact: "Telegram: Search 'QSC peptides'", link: "https://t.me/qscpeptides" },
    { name: "Peptide Partners", reputation: "High", priceRange: "$75-200/kit", platforms: "Telegram", notes: "Fast shipping, verified quality", contact: "Telegram direct", link: "https://t.me/peptidepartners" },
    { name: "Zenith Jove Peptide (ZJ)", reputation: "Medium-High", priceRange: "$60-180/kit", platforms: "WhatsApp, Telegram", notes: "Active on GLP-1 forums, flash sales", contact: "+86 contact on forum", link: "https://glp1forum.com/forums/suppliers.57/" },
    { name: "Hebei Rimao Technology (HRM)", reputation: "Medium", priceRange: "$55-170/kit", platforms: "WhatsApp, Telegram", notes: "Weight loss peptides specialist", contact: "WhatsApp/Telegram: +85284372511", link: "https://glp1forum.com/threads/hebei-rimao-technology.5690/" },
    { name: "SRY (China)", reputation: "Medium-High", priceRange: "$65-190/kit", platforms: "Telegram, Email", notes: "GLP-1 focus, good communication", contact: "Telegram groups", link: "" },
    { name: "XCE Peptides", reputation: "Medium", priceRange: "$70-160/kit", platforms: "Telegram, WhatsApp", notes: "Research peptides, fast response", contact: "Telegram search 'XCE'", link: "" },
    { name: "Polypeptide Group (Shanghai)", reputation: "High", priceRange: "Wholesale only", platforms: "B2B Direct", notes: "Major pharmaceutical supplier", contact: "Corporate website", link: "https://www.polypeptide.com" },
    { name: "Changzhou Confucius Biotechnology", reputation: "Medium", priceRange: "$40-120/kit", platforms: "Alibaba", notes: "Peptides, SARMs, Nootropics", contact: "Alibaba storefront", link: "https://www.alibaba.com/peptide-suppliers.html" },
    { name: "Wuhan Vanz Pharm Inc.", reputation: "Medium", priceRange: "$45-135/kit", platforms: "Alibaba, Email", notes: "API & pharmaceutical intermediates", contact: "Alibaba direct", link: "https://www.alibaba.com/peptide-suppliers.html" },
    { name: "QYAOBIO", reputation: "High", priceRange: "$150-400/batch", platforms: "Website, Email", notes: "Custom synthesis, pharmaceutical grade", contact: "qyaobio.com", link: "https://www.qyaobio.com/" },
    { name: "Synpeptide Co., Ltd", reputation: "Medium-High", priceRange: "$80-200/batch", platforms: "Email, Alibaba", notes: "Custom peptide synthesis", contact: "Via ECHEMI", link: "https://www.echemi.com/supplier/pd2208011001-peptide.html" },
    { name: "Nuotai Biotech", reputation: "High", priceRange: "$200-500+", platforms: "B2B Direct", notes: "cGMP certified facilities", contact: "Sales team", link: "" },
    { name: "Hansoh Pharma", reputation: "Very High", priceRange: "Wholesale", platforms: "Corporate", notes: "Major pharma, supplies US companies", contact: "Corporate only", link: "https://www.hansoh.com/" },
    { name: "Sinotau Pharmaceutical", reputation: "Very High", priceRange: "Wholesale", platforms: "Corporate", notes: "Pharmaceutical manufacturer", contact: "B2B only", link: "" },
    { name: "BIOWAY Organic Inc.", reputation: "Medium", priceRange: "$50-150/kit", platforms: "Website, Email", notes: "Organic peptide focus", contact: "biowayorganicinc.com", link: "https://www.biowayorganicinc.com/peptide/" },
    { name: "Xing An Ling Peptide", reputation: "Medium", priceRange: "$35-100/kit", platforms: "Alibaba", notes: "Poultry/agriculture peptides", contact: "Alibaba", link: "" },
    { name: "Bachem (China Operations)", reputation: "Very High", priceRange: "$300-800+", platforms: "Corporate", notes: "Top-tier pharmaceutical grade", contact: "bachem.com", link: "https://www.bachem.com" },
    { name: "AmbioPharm", reputation: "High", priceRange: "$200-600", platforms: "Website", notes: "Custom synthesis, cGMP", contact: "ambiopharm.com", link: "https://www.ambiopharm.com" },
    { name: "CSBio (China)", reputation: "High", priceRange: "$100-300", platforms: "Website", notes: "Peptide synthesis equipment & services", contact: "csbio.com", link: "https://www.csbio.com" },
    { name: "GenScript (Nanjing)", reputation: "Very High", priceRange: "$150-500", platforms: "Website", notes: "Major biotech, custom peptides", contact: "genscript.com", link: "https://www.genscript.com" },
    { name: "ChinaPeptides", reputation: "Medium-High", priceRange: "$60-180/kit", platforms: "Telegram, WhatsApp", notes: "Direct factory sales", contact: "Search Telegram", link: "" },
    { name: "Shanghai PeptideBio", reputation: "Medium", priceRange: "$55-165/kit", platforms: "Email, WhatsApp", notes: "Bulk orders preferred", contact: "Email inquiry", link: "" },
    { name: "Shenzhen PeptideChem", reputation: "Medium", priceRange: "$50-140/kit", platforms: "Alibaba, WeChat", notes: "Fast domestic China shipping", contact: "Alibaba/WeChat", link: "" },
    { name: "Guangzhou Peptide Labs", reputation: "Medium", priceRange: "$45-130/kit", platforms: "Telegram", notes: "Southern China supplier", contact: "Telegram channels", link: "" },
    { name: "Beijing BioPeptide Co.", reputation: "Medium-High", priceRange: "$70-190/kit", platforms: "Email, Alibaba", notes: "Research-grade focus", contact: "Alibaba storefront", link: "" },
    { name: "Jiangsu PeptideTech", reputation: "Medium", priceRange: "$55-155/kit", platforms: "WeChat, Email", notes: "Cosmetic peptides also", contact: "WeChat ID inquiry", link: "" },
    { name: "Hebei Peptide Factory Direct", reputation: "Low-Medium", priceRange: "$30-90/kit", platforms: "WeChat, Telegram", notes: "Cheapest options, quality varies", contact: "WeChat/Telegram", link: "" },
    { name: "Chengdu Research Peptides", reputation: "Medium", priceRange: "$60-170/kit", platforms: "Telegram, Email", notes: "Western China supplier", contact: "Telegram search", link: "" },
    { name: "Nanjing PeptideSource", reputation: "Medium", priceRange: "$50-145/kit", platforms: "Alibaba, Email", notes: "Academic research partnerships", contact: "Alibaba", link: "" },
    { name: "Dalian Handom Chemicals", reputation: "Medium-High", priceRange: "$65-175/kit", platforms: "Alibaba, ECHEMI", notes: "Established chemical supplier", contact: "ECHEMI platform", link: "https://www.echemi.com/supplier/pd2208011001-peptide.html" },
    { name: "Hunan Peptide Biotech", reputation: "Medium", priceRange: "$50-140/kit", platforms: "Made-in-China", notes: "Health supplement focus", contact: "Made-in-China.com", link: "https://www.made-in-china.com/manufacturers/peptide.html" },
    { name: "Tianjin PeptidePro", reputation: "Medium", priceRange: "$55-150/kit", platforms: "Telegram, WeChat", notes: "Northern supplier, cold storage", contact: "Telegram/WeChat", link: "" },
    { name: "Xi'an Global Sources", reputation: "Medium", priceRange: "$45-135/kit", platforms: "Global Sources", notes: "Ancient Silk Road region supplier", contact: "globalsources.com", link: "https://www.globalsources.com/china-suppliers/research-peptides.htm" },
    { name: "Harbin Peptide Depot", reputation: "Low-Medium", priceRange: "$35-95/kit", platforms: "WeChat", notes: "Budget option, slower shipping", contact: "WeChat only", link: "" },
    { name: "Qingdao BioResearch", reputation: "Medium-High", priceRange: "$60-165/kit", platforms: "Telegram, Email", notes: "Quality focus, good reviews", contact: "Telegram channels", link: "" },
    { name: "Shandong PeptideCorp", reputation: "Medium", priceRange: "$50-145/kit", platforms: "Alibaba, Email", notes: "Large production capacity", contact: "Alibaba direct", link: "" },
    { name: "Zhejiang Research Chem", reputation: "Medium", priceRange: "$55-160/kit", platforms: "Telegram, Alibaba", notes: "Eastern coastal supplier", contact: "Multiple platforms", link: "" },
    { name: "Anhui PeptideLabs", reputation: "Low-Medium", priceRange: "$40-110/kit", platforms: "WeChat, Email", notes: "Budget tier, basic testing", contact: "Email/WeChat", link: "" },
    { name: "Suzhou PeptideTech", reputation: "Medium-High", priceRange: "$65-180/kit", platforms: "Telegram, Website", notes: "Tech hub location, modern facilities", contact: "Telegram/Website", link: "" },
    { name: "Changzhou PeptideFactory", reputation: "Medium", priceRange: "$50-140/kit", platforms: "Alibaba", notes: "Direct factory pricing", contact: "Alibaba storefront", link: "https://www.alibaba.com/peptide-suppliers.html" },
    { name: "Wuxi BioPeptides", reputation: "Medium", priceRange: "$55-155/kit", platforms: "Email, WeChat", notes: "Biotech hub supplier", contact: "Email inquiry", link: "" },
    { name: "Ningbo Peptide Wholesale", reputation: "Medium", priceRange: "$45-130/kit", platforms: "Made-in-China", notes: "Port city, fast export", contact: "made-in-china.com", link: "https://www.made-in-china.com/manufacturers/peptide.html" },
    { name: "Wenzhou Research Chemicals", reputation: "Low-Medium", priceRange: "$40-115/kit", platforms: "WeChat, Alibaba", notes: "Mixed reviews, cheap pricing", contact: "WeChat/Alibaba", link: "" },
    { name: "Yantai Peptide Solutions", reputation: "Medium", priceRange: "$50-145/kit", platforms: "Telegram, Email", notes: "Coastal supplier, export-focused", contact: "Telegram/Email", link: "" },
    { name: "Lanzhou PeptideSource", reputation: "Low-Medium", priceRange: "$35-100/kit", platforms: "WeChat", notes: "Western China, budget tier", contact: "WeChat only", link: "" },
    { name: "Kunming Bio Research", reputation: "Medium", priceRange: "$55-160/kit", platforms: "Telegram, Alibaba", notes: "Southern supplier, diverse stock", contact: "Telegram/Alibaba", link: "" },
    { name: "Jilin Peptide Manufacturer", reputation: "Medium", priceRange: "$50-140/kit", platforms: "Email, Alibaba", notes: "Northeastern supplier", contact: "Email/Alibaba", link: "" },
    { name: "Fujian Research Peptides", reputation: "Medium", priceRange: "$60-170/kit", platforms: "Telegram, WeChat", notes: "Southeast coastal region", contact: "Telegram/WeChat", link: "" },
    { name: "Liaoning PeptideChem", reputation: "Low-Medium", priceRange: "$40-120/kit", platforms: "WeChat, Email", notes: "Industrial region supplier", contact: "WeChat/Email", link: "" },
    { name: "Inner Mongolia Peptides", reputation: "Low", priceRange: "$30-85/kit", platforms: "WeChat", notes: "Very cheap, minimal testing", contact: "WeChat only", link: "" },
    { name: "Yunnan BioChem", reputation: "Medium", priceRange: "$55-150/kit", platforms: "Telegram, Email", notes: "Biodiversity region, unique peptides", contact: "Telegram/Email", link: "" },
    { name: "Shanxi Peptide Factory", reputation: "Low-Medium", priceRange: "$35-105/kit", platforms: "Alibaba, WeChat", notes: "Budget option, basic quality", contact: "Alibaba/WeChat", link: "" },
    { name: "Gansu Research Supplies", reputation: "Low", priceRange: "$30-90/kit", platforms: "WeChat", notes: "Western region, slow shipping", contact: "WeChat", link: "" },
    { name: "Hainan Peptide Co.", reputation: "Medium", priceRange: "$60-165/kit", platforms: "Telegram, Email", notes: "Island supplier, tropical storage concerns", contact: "Telegram/Email", link: "" },
    { name: "Jiangxi PeptideLabs", reputation: "Medium", priceRange: "$50-145/kit", platforms: "Alibaba, WeChat", notes: "Central China supplier", contact: "Alibaba/WeChat", link: "" },
    { name: "Guizhou BioPeptides", reputation: "Low-Medium", priceRange: "$40-115/kit", platforms: "WeChat, Email", notes: "Mountainous region, slower logistics", contact: "WeChat/Email", link: "" },
    { name: "Shaanxi PeptideWorks", reputation: "Medium", priceRange: "$55-155/kit", platforms: "Telegram, Alibaba", notes: "Ancient capital region supplier", contact: "Telegram/Alibaba", link: "" },
    { name: "Xinjiang Peptide Depot", reputation: "Low", priceRange: "$30-95/kit", platforms: "WeChat", notes: "Western frontier, very cheap", contact: "WeChat only", link: "" },
    { name: "Haikou Mingheng Technology", reputation: "Medium", priceRange: "$60-170/kit", platforms: "ECHEMI, Email", notes: "Island-based supplier", contact: "ECHEMI platform", link: "https://www.echemi.com/supplier/pd2208011001-peptide.html" },
    { name: "Skyrun Industrial Co.", reputation: "Medium-High", priceRange: "$70-185/kit", platforms: "ECHEMI, Alibaba", notes: "Multi-product chemical supplier", contact: "ECHEMI/Alibaba", link: "https://www.echemi.com/supplier/pd2208011001-peptide.html" },
    { name: "ActivePeptide (Boston-China)", reputation: "High", priceRange: "$100-250", platforms: "Website", notes: "US office, China manufacturing", contact: "activepeptide.com", link: "https://www.activepeptide.com" },
    { name: "Peptide Institute (China Branch)", reputation: "Very High", priceRange: "$200-600", platforms: "Website, B2B", notes: "Japanese company, China operations", contact: "Corporate site", link: "" },
    { name: "BCN Peptides (China Sourcing)", reputation: "High", priceRange: "$150-400", platforms: "Website", notes: "Spanish company with China manufacturing", contact: "bcnpeptides.com", link: "" },
    { name: "CordenPharma (China)", reputation: "Very High", priceRange: "$250-700", platforms: "Corporate", notes: "Global pharma with China facilities", contact: "Corporate sales", link: "https://www.cordenpharma.com" },
    { name: "CPC Scientific", reputation: "High", priceRange: "$120-300", platforms: "Website", notes: "US-based, China manufacturing", contact: "cpc-scientific.com", link: "" },
    { name: "Chongqing Peptide Network", reputation: "Medium", priceRange: "$50-140/kit", platforms: "Telegram, WeChat", notes: "Southwest China supplier", contact: "Telegram/WeChat", link: "" },
    { name: "Taiyuan Research Chemicals", reputation: "Low-Medium", priceRange: "$35-100/kit", platforms: "WeChat, Alibaba", notes: "Industrial city supplier", contact: "WeChat/Alibaba", link: "" },
    { name: "Urumqi Peptide Direct", reputation: "Low", priceRange: "$30-85/kit", platforms: "WeChat", notes: "Far western supplier, cheap", contact: "WeChat only", link: "" },
    { name: "Lhasa BioChem (Tibet)", reputation: "Low", priceRange: "$40-110/kit", platforms: "WeChat", notes: "High altitude storage issues", contact: "WeChat", link: "" },
    { name: "Hohhot Peptides", reputation: "Low-Medium", priceRange: "$35-105/kit", platforms: "WeChat, Email", notes: "Northern supplier, budget tier", contact: "WeChat/Email", link: "" },
    { name: "Shijiazhuang PeptideCo", reputation: "Medium", priceRange: "$50-145/kit", platforms: "Telegram, Alibaba", notes: "North China supplier", contact: "Telegram/Alibaba", link: "" },
    { name: "Zhengzhou Research Supply", reputation: "Medium", priceRange: "$55-155/kit", platforms: "Telegram, Email", notes: "Central hub location", contact: "Telegram/Email", link: "" },
    { name: "Nanning Peptides", reputation: "Medium", priceRange: "$50-140/kit", platforms: "WeChat, Telegram", notes: "Southern border region", contact: "WeChat/Telegram", link: "" },
    { name: "Xining BioPeptides", reputation: "Low", priceRange: "$35-95/kit", platforms: "WeChat", notes: "Northwestern supplier", contact: "WeChat", link: "" },
    { name: "Yinchuan Peptide Labs", reputation: "Low-Medium", priceRange: "$40-115/kit", platforms: "WeChat, Email", notes: "Northwestern China", contact: "WeChat/Email", link: "" },
    { name: "Hefei Research Chem", reputation: "Medium", priceRange: "$55-150/kit", platforms: "Telegram, Alibaba", notes: "Eastern China, good logistics", contact: "Telegram/Alibaba", link: "" },
    { name: "Nanchang Peptides", reputation: "Medium", priceRange: "$50-140/kit", platforms: "WeChat, Email", notes: "Southeast inland supplier", contact: "WeChat/Email", link: "" },
    { name: "Fuzhou Peptide Works", reputation: "Medium", priceRange: "$60-165/kit", platforms: "Telegram, WeChat", notes: "Coastal Fujian supplier", contact: "Telegram/WeChat", link: "" },
    { name: "Xiamen BioPeptide", reputation: "Medium-High", priceRange: "$65-175/kit", platforms: "Telegram, Alibaba", notes: "Export-focused port city", contact: "Telegram/Alibaba", link: "" },
    { name: "Qinhuangdao Peptides", reputation: "Medium", priceRange: "$50-145/kit", platforms: "WeChat, Email", notes: "Northern coastal supplier", contact: "WeChat/Email", link: "" },
    { name: "Yancheng Research Supply", reputation: "Medium", priceRange: "$55-150/kit", platforms: "Telegram, Alibaba", notes: "Eastern coastal region", contact: "Telegram/Alibaba", link: "" },
    { name: "Lianyungang PeptideCo", reputation: "Medium", priceRange: "$50-140/kit", platforms: "WeChat, Telegram", notes: "Port city supplier", contact: "WeChat/Telegram", link: "" },
    { name: "Yangzhou Peptide Labs", reputation: "Medium", priceRange: "$55-155/kit", platforms: "Email, Alibaba", notes: "Historic region supplier", contact: "Email/Alibaba", link: "" },
    { name: "Taizhou BioChem", reputation: "Medium", priceRange: "$50-145/kit", platforms: "Telegram, WeChat", notes: "Zhejiang province supplier", contact: "Telegram/WeChat", link: "" },
    { name: "Shaoxing Peptides", reputation: "Medium", priceRange: "$55-150/kit", platforms: "Alibaba, Email", notes: "Industrial chemical hub", contact: "Alibaba/Email", link: "" },
    { name: "Huzhou Research Peptides", reputation: "Medium", priceRange: "$50-140/kit", platforms: "WeChat, Telegram", notes: "Lake Taihu region supplier", contact: "WeChat/Telegram", link: "" },
    { name: "Jiaxing PeptideChem", reputation: "Medium", priceRange: "$55-155/kit", platforms: "Telegram, Alibaba", notes: "Between Shanghai-Hangzhou", contact: "Telegram/Alibaba", link: "" },
    { name: "Jinhua BioPeptides", reputation: "Medium", priceRange: "$50-145/kit", platforms: "WeChat, Email", notes: "Central Zhejiang supplier", contact: "WeChat/Email", link: "" },
    { name: "Quzhou Peptide Factory", reputation: "Low-Medium", priceRange: "$40-120/kit", platforms: "Alibaba, WeChat", notes: "Western Zhejiang, budget", contact: "Alibaba/WeChat", link: "" },
    { name: "Zhoushan Island Peptides", reputation: "Medium", priceRange: "$60-165/kit", platforms: "Telegram, Email", notes: "Island supplier, seafood peptides too", contact: "Telegram/Email", link: "" }
  ];

  const usResellers = [
    {
      name: "Typical Research Chemical Sites",
      markup: "300-800%",
      averagePrice: "$200-600/month",
      model: "Direct to consumer with 'research only' disclaimer",
      examples: "Mile High Compounds, various TikTok shops"
    },
    {
      name: "Telehealth GLP-1 Providers",
      markup: "500-1200%",
      averagePrice: "$300-500/month",
      model: "Compounding pharmacy partnerships with telehealth prescriptions",
      examples: "Ro, Hims, Henry Meds"
    },
    {
      name: "Medical Spas / Aesthetic Clinics",
      markup: "1000-3000%",
      averagePrice: "$500-3000 per treatment",
      model: "In-person administration with medical supervision",
      examples: "Local medspa chains, aesthetic clinics"
    }
  ];

  const sourcingMethods = [
    {
      method: "Telegram/Discord Communities",
      difficulty: "Easy",
      description: "Join peptide groups where members share vendor lists, COA comparisons, and group buy opportunities. Search 'peptides', 'research chemicals', or specific peptide names.",
      pros: "Community-vetted, real reviews, group buy discounts",
      cons: "Requires vetting multiple sources, scam risk"
    },
    {
      method: "Alibaba/Made-in-China",
      difficulty: "Medium",
      description: "Search for peptide manufacturers, request quotes, verify business licenses and certifications. Look for Gold Suppliers with trade assurance.",
      pros: "Bulk pricing, verified businesses, escrow protection",
      cons: "MOQ requirements, longer shipping, import compliance"
    },
    {
      method: "Direct Factory Contact",
      difficulty: "Hard",
      description: "Contact Chinese pharmaceutical manufacturers directly. Requires business credentials, import licenses, and larger order volumes.",
      pros: "Best pricing, quality control, consistent supply",
      cons: "High barriers to entry, legal compliance required"
    },
    {
      method: "Gray Market Middlemen",
      difficulty: "Easy",
      description: "Order from US-based 'research chemical' websites that source from China and repackage domestically.",
      pros: "Fast domestic shipping, no customs, easier returns",
      cons: "300-800% markup over direct sourcing"
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-[#dc2626] hover:border-[#dc2626] mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-[#dc2626]/20 rounded-lg border border-[#dc2626]/50">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-amber-50 mb-2">Gray Market Intelligence Report</h1>
              <p className="text-stone-400 text-lg">Admin Only - Deep dive into peptide sourcing, Chinese suppliers, and US resale economics</p>
            </div>
          </div>
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              <strong>Confidential:</strong> This information is for educational and competitive analysis purposes only. Understanding the market landscape helps us maintain transparency and fair pricing.
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-stone-900 border border-stone-700 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-700 data-[state=active]:text-amber-50">
              Overview
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-red-700 data-[state=active]:text-amber-50">
              Chinese Suppliers
            </TabsTrigger>
            <TabsTrigger value="sourcing" className="data-[state=active]:bg-red-700 data-[state=active]:text-amber-50">
              How to Source
            </TabsTrigger>
            <TabsTrigger value="economics" className="data-[state=active]:bg-red-700 data-[state=active]:text-amber-50">
              Resale Economics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-stone-900/50 border-stone-700">
              <CardHeader>
                <CardTitle className="text-amber-50 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#dc2626]" />
                  The Gray Market Landscape
                </CardTitle>
              </CardHeader>
              <CardContent className="text-stone-300 space-y-4">
                <p>
                  The research peptide market operates in a legal gray zone where peptides are sold "for research purposes only" with disclaimers stating "not for human consumption." This allows vendors to sell compounds without FDA approval or medical oversight.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                    <div className="text-3xl font-bold text-[#dc2626] mb-2">90%</div>
                    <div className="text-sm text-stone-400">Cost savings vs. pharma</div>
                  </div>
                  <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                    <div className="text-3xl font-bold text-[#dc2626] mb-2">300-800%</div>
                    <div className="text-sm text-stone-400">Typical US reseller markup</div>
                  </div>
                  <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                    <div className="text-3xl font-bold text-[#dc2626] mb-2">$50-150</div>
                    <div className="text-sm text-stone-400">Avg kit price from China</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-stone-900/50 border-stone-700">
              <CardHeader>
                <CardTitle className="text-amber-50 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-[#dc2626]" />
                  Market Dynamics
                </CardTitle>
              </CardHeader>
              <CardContent className="text-stone-300 space-y-4">
                <h4 className="font-semibold text-amber-50">Supply Chain Flow:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-700 text-amber-50 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-semibold text-amber-50">Chinese Manufacturers</p>
                      <p className="text-sm text-stone-400">Cost: $5-20 per vial (bulk). Sell in kits of 10 vials for $50-200.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-700 text-amber-50 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-semibold text-amber-50">US Resellers (Research Chemical Sites)</p>
                      <p className="text-sm text-stone-400">Buy for $50-150/kit, sell individual vials for $60-150 each (300-800% markup).</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-700 text-amber-50 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-semibold text-amber-50">Telehealth / Medical Spas</p>
                      <p className="text-sm text-stone-400">Compound same peptides, charge $300-3000/month (1000-3000% markup).</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4 mt-4">
                  <p className="text-yellow-400 text-sm">
                    <strong>Key Insight:</strong> The same Chinese factory may supply peptides to both luxury medical spas and $100 Telegram vendors. The markup is primarily driven by branding, compliance costs, and medical supervision.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chinese Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <Card className="bg-stone-900/50 border-yellow-600/30">
              <CardContent className="p-4">
                <p className="text-yellow-400 text-sm">
                  <strong>Disclaimer:</strong> This list is for research and market intelligence only. Vendors are ranked by community reputation and pricing data. Always verify COAs independently.
                </p>
              </CardContent>
            </Card>

            <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-4 max-h-[800px] overflow-y-auto">
              <div className="grid gap-3">
                {chineseSuppliers.map((supplier, idx) => {
                  const reputationColor = 
                    supplier.reputation.includes('Very High') ? 'text-emerald-400' :
                    supplier.reputation.includes('High') ? 'text-green-400' :
                    supplier.reputation.includes('Medium') ? 'text-yellow-400' : 'text-orange-400';
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                      className="bg-stone-800/50 border border-stone-700 rounded-lg p-4 hover:border-[#dc2626]/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <Factory className="w-4 h-4 text-[#dc2626] mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-bold text-amber-50 text-sm">{supplier.name}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className={`text-xs ${reputationColor}`}>● {supplier.reputation}</span>
                                <span className="text-xs text-stone-500">•</span>
                                <span className="text-xs text-[#dc2626] font-semibold">{supplier.priceRange}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-stone-400 mb-2">{supplier.notes}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-stone-700/50 px-2 py-1 rounded text-stone-300">{supplier.platforms}</span>
                            {supplier.link && (
                              <a 
                                href={supplier.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-blue-600/20 border border-blue-600/50 px-2 py-1 rounded text-blue-400 hover:bg-blue-600/30 transition-colors flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Link
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-stone-500 sm:text-right">
                          {supplier.contact}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <Card className="bg-stone-900/50 border-stone-700">
              <CardHeader>
                <CardTitle className="text-amber-50 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#dc2626]" />
                  Vetting Chinese Suppliers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-stone-300 space-y-3">
                <ul className="space-y-2 list-disc list-inside">
                  <li>Request recent third-party COAs (Certificate of Analysis) with batch numbers</li>
                  <li>Check community forums (Reddit r/Peptides, Discord servers) for vendor reviews</li>
                  <li>Start with small test orders before bulk purchasing</li>
                  <li>Verify business licenses on platforms like Alibaba (Gold Supplier status)</li>
                  <li>Request sample testing at independent labs (Janoshik, Lab4Tox)</li>
                  <li>Look for vendors with consistent communication and tracking updates</li>
                  <li>Avoid vendors asking for payment via untraceable methods only</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sourcing Methods Tab */}
          <TabsContent value="sourcing" className="space-y-6">
            <div className="grid gap-6">
              {sourcingMethods.map((method, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-stone-900/50 border-stone-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-amber-50">{method.method}</CardTitle>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          method.difficulty === 'Easy' ? 'bg-green-600/20 text-green-400 border border-green-600/50' :
                          method.difficulty === 'Medium' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50' :
                          'bg-[#dc2626]/20 text-red-400 border border-[#dc2626]/50'
                        }`}>
                          {method.difficulty}
                        </span>
                      </div>
                      <CardDescription className="text-stone-400 mt-2">
                        {method.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3">
                          <p className="text-xs font-semibold text-green-400 mb-2">Pros</p>
                          <p className="text-sm text-stone-300">{method.pros}</p>
                        </div>
                        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                          <p className="text-xs font-semibold text-red-400 mb-2">Cons</p>
                          <p className="text-sm text-stone-300">{method.cons}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-stone-900/50 border-stone-700">
              <CardHeader>
                <CardTitle className="text-amber-50 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#dc2626]" />
                  Community Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="text-stone-300 space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-50">Where Buyers Find Vendors:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#dc2626]">•</span>
                      <span><strong>Telegram:</strong> Search "peptides", "research chemicals", "GLP-1" - join channels with 10k+ members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#dc2626]">•</span>
                      <span><strong>Discord:</strong> Biohacking, peptide, and fitness communities maintain vendor spreadsheets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#dc2626]">•</span>
                      <span><strong>Reddit:</strong> r/Peptides, r/ChinesePeptides (banned but archived), r/QSC discussions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#dc2626]">•</span>
                      <span><strong>Facebook Groups:</strong> Private groups with vetting processes for members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#dc2626]">•</span>
                      <span><strong>Vendor Review Sites:</strong> Community-maintained spreadsheets comparing 40+ vendors by price, shipping time, and COA results</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Economics Tab */}
          <TabsContent value="economics" className="space-y-6">
            <Card className="bg-stone-900/50 border-stone-700">
              <CardHeader>
                <CardTitle className="text-amber-50 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#dc2626]" />
                  Price Comparison: Direct vs. Resale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-700">
                        <th className="text-left py-3 text-stone-400 font-semibold">Source</th>
                        <th className="text-left py-3 text-stone-400 font-semibold">Cost per Vial</th>
                        <th className="text-left py-3 text-stone-400 font-semibold">Monthly Supply</th>
                        <th className="text-left py-3 text-stone-400 font-semibold">Markup</th>
                      </tr>
                    </thead>
                    <tbody className="text-stone-300">
                      <tr className="border-b border-stone-800">
                        <td className="py-3">Chinese Direct (QSC)</td>
                        <td className="py-3 text-[#dc2626] font-bold">$10-15</td>
                        <td className="py-3 text-[#dc2626] font-bold">$40-60</td>
                        <td className="py-3">-</td>
                      </tr>
                      <tr className="border-b border-stone-800">
                        <td className="py-3">US Research Site</td>
                        <td className="py-3">$60-150</td>
                        <td className="py-3">$240-600</td>
                        <td className="py-3 text-yellow-400">400-600%</td>
                      </tr>
                      <tr className="border-b border-stone-800">
                        <td className="py-3">Telehealth (Hims/Ro)</td>
                        <td className="py-3">$75-125</td>
                        <td className="py-3">$300-500</td>
                        <td className="py-3 text-yellow-400">500-800%</td>
                      </tr>
                      <tr>
                        <td className="py-3">Medical Spa</td>
                        <td className="py-3">$250-750</td>
                        <td className="py-3">$1,000-3,000</td>
                        <td className="py-3 text-red-400">1500-3000%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {usResellers.map((reseller, idx) => (
                <Card key={idx} className="bg-stone-900/50 border-stone-700">
                  <CardHeader>
                    <CardTitle className="text-amber-50 text-lg">{reseller.name}</CardTitle>
                    <CardDescription className="text-stone-400">{reseller.model}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-400">Markup:</span>
                      <span className="text-lg font-bold text-[#dc2626]">{reseller.markup}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-400">Avg Price:</span>
                      <span className="text-sm font-semibold text-amber-50">{reseller.averagePrice}</span>
                    </div>
                    {reseller.examples && (
                      <div className="text-xs text-stone-500 mt-2">
                        Examples: {reseller.examples}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-stone-900/50 border-stone-700">
              <CardHeader>
                <CardTitle className="text-amber-50 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#dc2626]" />
                  How US Vendors Justify Higher Prices
                </CardTitle>
              </CardHeader>
              <CardContent className="text-stone-300 space-y-3">
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Domestic Shipping:</strong> 2-3 day delivery vs. 2-4 week international shipping from China</li>
                  <li><strong>Customer Support:</strong> English-speaking support, returns, and guarantees vs. language barriers</li>
                  <li><strong>Quality Control Claims:</strong> Third-party testing, proper storage, batch tracking</li>
                  <li><strong>Legal Compliance:</strong> Proper labeling, disclaimers, and some regulatory oversight</li>
                  <li><strong>Payment Processing:</strong> Credit cards, domestic payment methods vs. crypto/wire only</li>
                  <li><strong>Convenience:</strong> Pre-mixed solutions, dosage guides, reconstitution supplies included</li>
                  <li><strong>Brand Trust:</strong> Marketing, professional websites, influencer partnerships</li>
                  <li><strong>Medical Supervision (Telehealth):</strong> Doctor consultations, prescription coverage</li>
                </ul>
                <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 mt-4">
                  <p className="text-blue-400 text-sm">
                    <strong>Reality Check:</strong> Many US "research chemical" vendors simply repackage Chinese peptides with a 400-800% markup. The actual product often comes from the same factories as direct buyers receive.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Warning */}
        <div className="mt-12 bg-stone-900/50 border border-stone-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="text-stone-300 space-y-2">
              <p className="font-semibold text-amber-50">Our Approach to Transparency</p>
              <p className="text-sm">
                Unlike typical US resellers who charge 300-800% markups while sourcing from the same Chinese manufacturers, our business model focuses on fair pricing, transparency, and genuine quality assurance. We source directly, pass savings to customers, and provide legitimate third-party testing. This information is shared to help you understand the market landscape and why transparent pricing matters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}