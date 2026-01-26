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
    {
      name: "QSC (Qingdao Sigma Chemical Co.)",
      reputation: "High",
      priceRange: "$50-150 per kit (10 vials)",
      platforms: "Telegram, WhatsApp, Email",
      notes: "Most popular vendor. Known for bulk pricing. Community-tested COAs.",
      contact: "Telegram groups, email direct",
      risks: "Communication gaps, occasional shipping delays"
    },
    {
      name: "Peptide Partners",
      reputation: "Medium-High",
      priceRange: "$75-200 per kit",
      platforms: "Telegram, WeChat",
      notes: "Good for international shipping. Verified by multiple communities.",
      contact: "Telegram: Direct contact",
      risks: "Higher prices than QSC but faster shipping"
    },
    {
      name: "Generic Alibaba/Global Sources Manufacturers",
      reputation: "Variable",
      priceRange: "$30-100 per kit (bulk orders)",
      platforms: "Alibaba, Made-in-China, Global Sources",
      notes: "MOQ (Minimum Order Quantities) apply. Good for bulk wholesale.",
      contact: "Platform messaging, email",
      risks: "Quality varies significantly. Requires extensive vetting."
    },
    {
      name: "Nuotai Biotech",
      reputation: "High (Pharmaceutical Grade)",
      priceRange: "$200-500+ per batch",
      platforms: "Direct B2B contact",
      notes: "Legitimate pharma manufacturer. Higher quality but requires business credentials.",
      contact: "Direct sales team",
      risks: "Higher MOQ, not consumer-friendly"
    },
    {
      name: "Hansoh Pharma / Sinotau Pharmaceutical",
      reputation: "High (Legitimate Manufacturers)",
      priceRange: "Wholesale pricing only",
      platforms: "B2B Direct",
      notes: "Major pharmaceutical companies. Supply chain partners for US pharma.",
      contact: "Corporate sales only",
      risks: "Not accessible to small buyers"
    }
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
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-red-600/20 rounded-lg border border-red-600/50">
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
                  <Globe className="w-5 h-5 text-red-600" />
                  The Gray Market Landscape
                </CardTitle>
              </CardHeader>
              <CardContent className="text-stone-300 space-y-4">
                <p>
                  The research peptide market operates in a legal gray zone where peptides are sold "for research purposes only" with disclaimers stating "not for human consumption." This allows vendors to sell compounds without FDA approval or medical oversight.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                    <div className="text-3xl font-bold text-red-600 mb-2">90%</div>
                    <div className="text-sm text-stone-400">Cost savings vs. pharma</div>
                  </div>
                  <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                    <div className="text-3xl font-bold text-red-600 mb-2">300-800%</div>
                    <div className="text-sm text-stone-400">Typical US reseller markup</div>
                  </div>
                  <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                    <div className="text-3xl font-bold text-red-600 mb-2">$50-150</div>
                    <div className="text-sm text-stone-400">Avg kit price from China</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-stone-900/50 border-stone-700">
              <CardHeader>
                <CardTitle className="text-amber-50 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
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
            <div className="grid gap-4">
              {chineseSuppliers.map((supplier, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-stone-900/50 border-stone-700 hover:border-red-600/30 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-amber-50 flex items-center gap-2">
                            <Factory className="w-5 h-5 text-red-600" />
                            {supplier.name}
                          </CardTitle>
                          <CardDescription className="text-stone-400 mt-2">
                            Reputation: <span className={supplier.reputation.includes('High') ? 'text-green-400' : 'text-yellow-400'}>{supplier.reputation}</span>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-red-600 font-bold text-lg">{supplier.priceRange}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-stone-400 mb-1">Contact Methods</p>
                          <p className="text-sm text-amber-50">{supplier.platforms}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-400 mb-1">Access</p>
                          <p className="text-sm text-amber-50">{supplier.contact}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 mb-1">Notes</p>
                        <p className="text-sm text-stone-300">{supplier.notes}</p>
                      </div>
                      <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                        <p className="text-xs text-red-400">
                          <strong>Risks:</strong> {supplier.risks}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-stone-900/50 border-stone-700">
              <CardHeader>
                <CardTitle className="text-amber-50 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
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
                          'bg-red-600/20 text-red-400 border border-red-600/50'
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
                  <Users className="w-5 h-5 text-red-600" />
                  Community Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="text-stone-300 space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-50">Where Buyers Find Vendors:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span><strong>Telegram:</strong> Search "peptides", "research chemicals", "GLP-1" - join channels with 10k+ members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span><strong>Discord:</strong> Biohacking, peptide, and fitness communities maintain vendor spreadsheets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span><strong>Reddit:</strong> r/Peptides, r/ChinesePeptides (banned but archived), r/QSC discussions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span><strong>Facebook Groups:</strong> Private groups with vetting processes for members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
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
                  <DollarSign className="w-5 h-5 text-red-600" />
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
                        <td className="py-3 text-red-600 font-bold">$10-15</td>
                        <td className="py-3 text-red-600 font-bold">$40-60</td>
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
                      <span className="text-lg font-bold text-red-600">{reseller.markup}</span>
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
                  <FileText className="w-5 h-5 text-red-600" />
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