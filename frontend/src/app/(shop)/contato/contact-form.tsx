"use client";

import { type FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACT_EMAIL = "contato@ahorafit.com";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(`Contato pelo site - ${name}`);
    const body = encodeURIComponent(
      [
        `Nome: ${name}`,
        `E-mail: ${email}`,
        phone ? `Telefone: ${phone}` : null,
        "",
        "Mensagem:",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <span className="text-sm font-bold uppercase tracking-wide text-primary">
          Envie uma mensagem
        </span>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-950">
          Como podemos ajudar?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Preencha os dados abaixo e abriremos seu aplicativo de e-mail com a mensagem pronta para envio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Nome *</Label>
          <Input
            id="contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            required
            className="h-11 rounded-xl bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">E-mail *</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            required
            className="h-11 rounded-xl bg-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone">Telefone</Label>
        <Input
          id="contact-phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="(11) 99999-9999"
          className="h-11 rounded-xl bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Mensagem *</Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Conte o que você precisa..."
          required
          className="min-h-36 rounded-xl bg-white"
        />
      </div>

      <Button type="submit" className="h-12 w-full rounded-xl font-semibold sm:w-auto sm:px-7">
        Enviar mensagem
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
