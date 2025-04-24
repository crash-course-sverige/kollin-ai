"use server";

import { generateObject } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod";
import { CourseChapterTextData } from "./get-course-chapter-with-text-data";


export async function extractKeywordsFromChapters(courseChaptersTexts: CourseChapterTextData) {

  const chaptersWithGeneratedKeywords = [];
  
  for (const courseChapterText of courseChaptersTexts) {
    if (!courseChapterText.markdown) {
      console.error("❌ No markdown found for chapter. Skipping...");
      continue;
    }
    const { object } = await generateObject({
      model: anthropic("claude-3-7-sonnet-20250219"),
      schema: z.object({
        keywords: z.array(z.string()),
      }),
      system: SYSTEM_PROMPT,
      prompt: courseChapterText.markdown,
    });

    console.log(`✅ Keywords successfully extracted for chapter "${courseChapterText.title}"`);
    console.log("✅ Keywords: \n", object.keywords);

    chaptersWithGeneratedKeywords.push({
      keywords: object.keywords,
      chapterId: courseChapterText.chapterId,
      chapterTitle: courseChapterText.title,
    });
  }

  return chaptersWithGeneratedKeywords;
  
}


const SYSTEM_PROMPT = `
# Prompt: Extrahera matematiska nyckelbegrepp

Du ska extrahera nyckelbegrepp från matematiska universitetstexter. Följ dessa instruktioner exakt:

## Basregler
1. Extrahera specifika matematiska begrepp som är viktiga för ämnet
2. Inkludera begrepp från rubriker
3. Sortera begrepp i den ordning de dyker upp i texten
4. Presentera resultatet som en enkel txt-lista, ett begrepp per rad
5. **Inkludera rätt nivå av begrepp**: Extremt grundläggande begrepp som "addition" inkluderas INTE, men universitetsrelevanta begrepp som "derivata", "integral" eller "funktion" SKA inkluderas om de är centrala i texten och NÄMNS EXPLICIT. 
6. Du FÅR INTE extrahera begrepp som INTE finns i texten.

## KRITISKA REGLER - MÅSTE FÖLJAS
1. **INGA DUBLETTER TILLÅTS**: Samma begrepp får endast visas EN gång oavsett grammatisk form
   - Singular/plural (t.ex. "koordinat"/"koordinater") = SAMMA BEGREPP
   - Bestämd/obestämd form (t.ex. "derivata"/"derivatan") = SAMMA BEGREPP
   - Verb/substantiv (t.ex. "projicera"/"projektion") = SAMMA BEGREPP
   - Olika prepositioner (t.ex. "projektion på"/"projektion av") = SAMMA BEGREPP

2. **Dela upp sammansatta begrepp**: "Gränsvärden och kontinuitet" → "Gränsvärde", "Kontinuitet"

3. **Bevara sammanhängande begrepp**: "Derivatans definition" är ETT begrepp

4. **Om input inte ges i textformat/markdown-format, utan exempelvis är en länk som leder till en bild som du inte kan extrahera text från, ska du inte hitta på något utan isåfall ange att 'Inputen gavs inte i ett textformat jag inte kunde tyda, inga nyckelbegrepp har därför extraherats'. 

5. Extrahera INTE begrepp som INTE FINNS MED I TEXTEN!!!!

## Process
1. Identifiera alla potentiella begrepp
2. Eliminera alla grammatiska varianter och behåll endast EN variant av varje begrepp
3. Dubbelkolla särskilt för singular/plural-dubletter och verb/substantiv-dubletter

## Exempel
Text: "Projektion på vektor. Projektionen av en vektor. Man kan projicera en vektor..."

### FELAKTIGT resultat:
Projektion på vektor
Projektion av en vektor
Projicera en vektor

###KORREKT resultat (välj EN variant):
Projektion på vektor

## SLUTKONTROLL
Gå igenom din lista en sista gång för att verifiera att inga grammatiska varianter återstår.
`;
