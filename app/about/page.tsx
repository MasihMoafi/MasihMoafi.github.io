import { getCVContent } from '../../lib/cv';
import AboutClient from '../components/AboutClient';

export default async function About() {
  const cvContent = await getCVContent();

  return <AboutClient cvContent={cvContent} />;
}