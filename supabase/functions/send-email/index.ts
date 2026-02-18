// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.9";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variables d'environnement Supabase non configurées");
    }

    // Parse request body
    const reqBody = await req.json().catch(() => null);
    if (!reqBody) throw new Error("Corps de requête JSON invalide ou vide");

    const { to, subject, body: emailBody, htmlBody } = reqBody as {
      to?: string;
      subject?: string;
      body?: string;
      htmlBody?: string;
    };

    if (!to || !subject || !emailBody) {
      throw new Error("Champs requis manquants : to, subject, body");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Format d'adresse email invalide");
    }

    // Récupérer la config SMTP depuis Supabase REST API
    const fetchHeaders = new Headers();
    fetchHeaders.set("apikey", supabaseServiceKey);
    fetchHeaders.set("Authorization", `Bearer ${supabaseServiceKey}`);
    fetchHeaders.set("Content-Type", "application/json");

    const smtpRes = await fetch(`${supabaseUrl}/rest/v1/smtp_config?limit=1`, {
      method: "GET",
      headers: fetchHeaders,
    });

    if (!smtpRes.ok) {
      const text = await smtpRes.text().catch(() => "");
      throw new Error(`Impossible de récupérer la config SMTP: ${smtpRes.status} ${text}`);
    }

    const smtpArr = await smtpRes.json();
    if (!Array.isArray(smtpArr) || smtpArr.length === 0) {
      throw new Error("Configuration SMTP introuvable. Configurez le SMTP dans les Paramètres Admin.");
    }

    const smtp = smtpArr[0];

    if (!smtp || typeof smtp !== "object") {
      throw new Error("Configuration SMTP vide ou invalide");
    }

    // Validation des champs requis
    const required = ["host", "port", "username", "password", "from_email"];
    const missing: string[] = [];
    for (const key of required) {
      if (!(key in smtp) || smtp[key] === null || smtp[key] === undefined || String(smtp[key]).trim() === "") {
        missing.push(key);
      }
    }
    if (missing.length > 0) {
      throw new Error(`Configuration SMTP incomplète, champs manquants : ${missing.join(", ")}`);
    }

    const smtpPort = Number(smtp.port) || 587;
    const useTls = smtp.use_tls !== false; // true par défaut

    console.log(`Connexion SMTP: ${smtp.host}:${smtpPort} (TLS: ${useTls})`);

    // Créer le transporteur nodemailer
    const transporter = nodemailer.createTransport({
      host: String(smtp.host),
      port: smtpPort,
      secure: smtpPort === 465, // true pour port 465 (SSL), false pour 587 (STARTTLS)
      requireTLS: smtpPort === 587, // forcer STARTTLS sur port 587
      auth: {
        user: String(smtp.username),
        pass: String(smtp.password),
      },
      tls: {
        rejectUnauthorized: false, // accepter les certificats auto-signés
        ciphers: "SSLv3",
      },
      connectionTimeout: 10000, // 10 secondes
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    // Envoyer l'email
    const mailOptions = {
      from: `"${smtp.from_name || "Premunia"}" <${smtp.from_email}>`,
      to,
      subject,
      text: String(emailBody),
      html: htmlBody ? String(htmlBody) : undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès:", info.messageId);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email envoyé à ${to}`,
        messageId: info.messageId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Erreur send-email:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
