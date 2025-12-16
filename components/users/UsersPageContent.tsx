'use client';

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCog,
  Shield,
  Eye,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

interface UsersPageContentProps {
  users: User[];
  organizationName: string;
  inviteDialog: ReactNode;
  bulkImportDialog: ReactNode;
  userList: ReactNode;
}

export function UsersPageContent({
  users,
  organizationName,
  inviteDialog,
  bulkImportDialog,
  userList,
}: UsersPageContentProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const statsCards = [
    {
      title: "Total de Usuários",
      value: users.length,
      icon: Users,
      colorClass: "pm-terracotta",
      bgGradient: "from-pm-terracotta/10 to-white",
      borderColor: "border-pm-terracotta/20",
    },
    {
      title: "Administradores",
      value: users.filter((u) => u.role === "admin").length,
      icon: Shield,
      colorClass: "pm-olive",
      bgGradient: "from-pm-olive/10 to-white",
      borderColor: "border-pm-olive/20",
    },
    {
      title: "Gerentes",
      value: users.filter((u) => u.role === "manager").length,
      icon: UserCog,
      colorClass: "pm-green-dark",
      bgGradient: "from-pm-green-dark/10 to-white",
      borderColor: "border-pm-green-dark/20",
    },
    {
      title: "Membros",
      value: users.filter((u) => u.role === "member").length,
      icon: Eye,
      colorClass: "pm-olive",
      bgGradient: "from-pm-olive-light/30 to-white",
      borderColor: "border-pm-olive/20",
    },
  ];

  const roleInfo = [
    {
      role: "Administrador",
      description: "Acesso total ao sistema, incluindo gestão de usuários e configurações",
      icon: Shield,
      color: "text-pm-terracotta",
    },
    {
      role: "Gerente",
      description: "Pode criar e gerenciar diagnósticos, visualizar relatórios",
      icon: UserCog,
      color: "text-pm-olive",
    },
    {
      role: "Membro",
      description: "Pode visualizar diagnósticos e responder questionários",
      icon: Users,
      color: "text-pm-green-dark",
    },
    {
      role: "Visualizador",
      description: "Apenas visualização de diagnósticos e relatórios",
      icon: Eye,
      color: "text-text-muted",
    },
  ];

  const securityItems = [
    { text: "Todos os dados são isolados por organização (RLS multi-tenant)", icon: Building2 },
    { text: "Apenas administradores podem gerenciar usuários", icon: ShieldCheck },
    { text: "Usuários desativados não podem mais acessar a plataforma", icon: AlertTriangle },
    { text: "Alterações de role são aplicadas imediatamente no próximo login", icon: CheckCircle2 },
  ];

  return (
    <div ref={ref} className="p-6 pb-12 space-y-6 flex-1 bg-white/50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pm-terracotta/20 to-pm-olive/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-pm-terracotta" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-text-heading">
              Gerenciar Usuários
            </h1>
            <p className="text-text-secondary mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {organizationName} • {users.length} {users.length === 1 ? "usuário" : "usuários"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {bulkImportDialog}
          {inviteDialog}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 + index * 0.1 }}
          >
            <Card className={cn(
              "bg-gradient-to-br transition-all duration-300 hover:shadow-lg",
              card.bgGradient,
              card.borderColor
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">{card.title}</p>
                    <p className={cn("text-3xl font-bold", `text-${card.colorClass}`)}>
                      {card.value}
                    </p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    `bg-${card.colorClass}/20`
                  )}>
                    <card.icon className={cn("w-5 h-5", `text-${card.colorClass}`)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* User List Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-l-4 border-l-pm-terracotta">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-pm-terracotta" />
            </div>
            <div>
              <CardTitle className="font-display text-xl text-text-heading">
                Usuários da Organização
              </CardTitle>
              <CardDescription>
                Gerencie os membros, altere roles e controle o acesso à plataforma
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {userList}
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Roles Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-l-4 border-l-pm-olive h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pm-olive/10 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-pm-olive" />
              </div>
              <CardTitle className="font-display text-lg text-text-heading">
                Sobre os Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {roleInfo.map((item, index) => (
                <motion.div
                  key={item.role}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-bg-sage/50 transition-colors"
                >
                  <item.icon className={cn("w-5 h-5 mt-0.5", item.color)} />
                  <div>
                    <strong className="text-text-heading text-sm">{item.role}:</strong>{" "}
                    <span className="text-text-secondary text-sm">{item.description}</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="border-l-4 border-l-pm-green-dark h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pm-green-dark/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-pm-green-dark" />
              </div>
              <CardTitle className="font-display text-lg text-text-heading">
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {securityItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-bg-sage/50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-pm-green-light/50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-pm-green-dark" />
                  </div>
                  <span className="text-text-secondary text-sm">{item.text}</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export function UsersErrorState({ error }: { error: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div className="p-6">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
                Erro ao carregar usuários
              </h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                {error}
              </p>
              <Button
                asChild
                className="bg-pm-terracotta hover:bg-pm-terracotta-hover text-white"
              >
                <Link href="/dashboard">
                  Voltar ao Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
