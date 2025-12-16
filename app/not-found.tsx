import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
            <Search className="h-8 w-8 text-gray-500" />
          </div>
          <CardTitle className="text-2xl text-text-heading">
            Página não encontrada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-text-secondary text-center">
            A página que você está procurando não existe ou foi movida para outro
            endereço.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1" variant="primary">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Ir para início
              </Link>
            </Button>
            <Button asChild className="flex-1" variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ir ao Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
