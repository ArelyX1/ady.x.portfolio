export interface Certification {
  id: string;
  title: string;
  issuer: string;
  description: string;
  image: string;
  tags: string[];
  category: 'technical' | 'leadership';
  issuedAt: string;
  link: string;
  linkText: string;
}
