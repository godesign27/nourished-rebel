import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Music } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSocialMediaLinks } from '../../lib/api';
import { Drawer } from '../shared/Drawer';
import type { SocialMediaLink } from '../../types';

const getSocialIcon = (platform: string) => {
  const iconMap: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    tiktok: Music,
  };
  return iconMap[platform.toLowerCase()] || Instagram;
};

const DISCLAIMER_FULL = `The information provided on this website and through services offered by Nourished Rebel is for educational and informational purposes only and is not intended as medical advice, diagnosis, or treatment.

Nourished Rebel does not provide medical services and does not diagnose, treat, cure, or prevent any disease. The content shared, including recommendations related to nutrition, lifestyle, supplements, and wellness practices, is not a substitute for professional medical advice, diagnosis, or treatment from a licensed physician or qualified healthcare provider.

Always seek the advice of your physician or other qualified healthcare provider regarding any medical condition or before making changes to your diet, exercise program, supplement routine, medications, or health regimen. This is especially important if you are pregnant, nursing, have a medical condition, or are taking prescription medications.

Statements regarding dietary supplements or wellness products have not been evaluated by the Food and Drug Administration (FDA). Any products or protocols discussed are not intended to diagnose, treat, cure, or prevent any disease.

By using this website and participating in services offered by Nourished Rebel, you acknowledge and agree that you are responsible for your own health decisions and that Nourished Rebel is not liable for any adverse effects or consequences resulting from the use or application of the information provided.`;

export function Footer() {
  const [email, setEmail] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    const links = await getSocialMediaLinks();
    setSocialLinks(links);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <>
      <footer className="bg-clay-950">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="pb-10 mb-10">
            <p className="text-body italic text-clay-100 leading-relaxed max-w-4xl mx-auto text-center mb-3">
              Nourished Rebel offers educational wellness information only and does not provide medical advice, diagnosis, or treatment. We are not liable for health decisions made based on this content. Always consult a qualified healthcare provider before making changes to your health regimen.
            </p>
            <div className="text-center">
              <button
                onClick={() => setIsDisclaimerOpen(true)}
                className="text-body-small text-clay-400 hover:text-white underline underline-offset-2 transition-colors duration-fast"
              >
                Read Full Disclaimer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-heading-4 font-bold text-white mb-4">
                Nourished Rebel
              </h3>
              <p className="text-body-small text-clay-300 leading-relaxed">
                Empower people to reclaim their health through real food, holistic nutrition, and self-trust.
              </p>
            </div>

            <div>
              <h4 className="text-body font-semibold text-white mb-4">
                Explore
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/programs"
                    className="text-body-small text-clay-300 hover:text-white transition-colors duration-fast"
                  >
                    Programs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/resources"
                    className="text-body-small text-clay-300 hover:text-white transition-colors duration-fast"
                  >
                    Resources
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="text-body-small text-clay-300 hover:text-white transition-colors duration-fast"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    to="/resources"
                    className="text-body-small text-clay-300 hover:text-white transition-colors duration-fast"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-body font-semibold text-white mb-4">
                Support
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/contact"
                    className="text-body-small text-clay-300 hover:text-white transition-colors duration-fast"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/book-session"
                    className="text-body-small text-clay-300 hover:text-white transition-colors duration-fast"
                  >
                    Book a Session
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-body-small text-clay-300 hover:text-white transition-colors duration-fast"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-body-small text-clay-300 hover:text-white transition-colors duration-fast"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-body-small text-clay-300 hover:text-white transition-colors duration-fast"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-body font-semibold text-white mb-4">
                Connect
              </h4>
              <p className="text-body-small text-clay-300 mb-4 leading-relaxed">
                Get simple, nourishing guidance delivered to your inbox
              </p>
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 border border-clay-800 rounded-lg text-body-small focus:outline-none focus:ring-2 focus:ring-clay-500 focus:border-transparent bg-clay-900 text-white placeholder-clay-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-clay-700 text-white rounded-lg text-body-small font-medium hover:bg-clay-600 transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-clay-500 focus:ring-offset-2 focus:ring-offset-clay-950"
                  >
                    Join
                  </button>
                </div>
              </form>
              {socialLinks.length > 0 && (
                <div className="flex gap-4">
                  {socialLinks.map((link) => {
                    const Icon = getSocialIcon(link.platform);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-clay-300 hover:text-white transition-colors duration-fast"
                        aria-label={link.platform}
                      >
                        <Icon size={24} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 text-center">
            <p className="text-body-small text-clay-400">
              &copy; {new Date().getFullYear()} Nourished Rebel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <Drawer
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        title="Full Disclaimer"
        size="md"
      >
        <div className="space-y-4">
          {DISCLAIMER_FULL.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-body-small text-text-primary leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </Drawer>
    </>
  );
}
