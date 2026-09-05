import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { LANGUAGES } from "@/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("kna-lang", code);
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-primary shrink-0" />
      <Select value={i18n.language} onValueChange={handleChange}>
        <SelectTrigger className="w-full bg-muted/40 border-white/10 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72 overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.nativeLabel}</span>
                <span className="text-muted-foreground text-xs">({lang.label})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
