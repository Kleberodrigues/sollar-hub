'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Shield, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface QuestionnaireIntroductionProps {
  title?: string;
  introductionText?: string | null;
  lgpdConsentText?: string | null;
  onAccept: () => void;
}

export function QuestionnaireIntroduction({
  title: _title,
  introductionText,
  lgpdConsentText,
  onAccept,
}: QuestionnaireIntroductionProps) {
  const [lgpdAccepted, setLgpdAccepted] = useState(false);

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      {introductionText && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-pm-green-dark" />
              <CardTitle className="text-xl">Bem-vindo(a)!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-text-secondary">
              <ReactMarkdown>{introductionText}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LGPD Consent Card */}
      {lgpdConsentText && (
        <Card className="border-pm-green-dark/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-pm-green-dark" />
              <CardTitle className="text-xl">Termo de Consentimento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none text-text-secondary bg-bg-secondary p-4 rounded-lg">
              <ReactMarkdown>{lgpdConsentText}</ReactMarkdown>
            </div>

            {/* LGPD Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-pm-green-light/10 rounded-lg border border-pm-green-dark/20">
              <Checkbox
                id="lgpd-consent"
                checked={lgpdAccepted}
                onCheckedChange={(checked) => setLgpdAccepted(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="lgpd-consent"
                className="text-sm font-medium text-text-heading cursor-pointer flex-1"
              >
                Li e aceito os termos acima. Estou ciente de que minhas respostas
                são anônimas e serão utilizadas exclusivamente para melhorias no
                ambiente de trabalho.
              </label>
            </div>

            {/* Start Button */}
            <Button
              onClick={onAccept}
              disabled={!lgpdAccepted}
              className="w-full"
              size="lg"
            >
              Iniciar Questionário
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* If no LGPD text, just show a simple start button */}
      {!lgpdConsentText && (
        <Button onClick={onAccept} className="w-full" size="lg">
          Iniciar Questionário
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      )}
    </div>
  );
}
