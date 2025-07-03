export interface ExtractedTask {
  id: string
  content: string
  priority: "high" | "medium" | "low"
  context: string
  originalText: string
  confidence: number
}

export interface TaskExtractionResult {
  tasks: ExtractedTask[]
  processedNote: string
}

export class TaskExtractor {
  private static readonly TASK_KEYWORDS = [
    "todo",
    "to do",
    "to-do",
    "task",
    "action",
    "need to",
    "should",
    "must",
    "remember to",
    "don't forget",
    "follow up",
    "followup",
    "complete",
    "finish",
    "implement",
    "create",
    "build",
    "fix",
    "update",
    "review",
    "schedule",
    "call",
    "email",
    "contact",
    "meet",
    "discuss",
    "prepare",
  ]

  private static readonly PRIORITY_KEYWORDS = {
    high: ["urgent", "asap", "critical", "important", "priority", "deadline", "due"],
    medium: ["should", "need", "important", "soon"],
    low: ["maybe", "consider", "eventually", "when possible", "nice to have"],
  }

  private static readonly LIST_PATTERNS = [
    /^[\s]*[-*•]\s+(.+)$/gm, // Bullet points (-, *, •)
    /^[\s]*\d+[.)]\s+(.+)$/gm, // Numbered lists (1. or 1))
    /^[\s]*\[[\sx]\]\s+(.+)$/gm, // Checkboxes ([ ] or [x])
    /^[\s]*○\s+(.+)$/gm, // Circle bullets
    /^[\s]*→\s+(.+)$/gm, // Arrow bullets
  ]

  static extractTasks(noteContent: string): TaskExtractionResult {
    const tasks: ExtractedTask[] = []
    let processedNote = noteContent
    const lines = noteContent.split("\n")

    // Extract tasks from list patterns
    this.LIST_PATTERNS.forEach((pattern) => {
      let match
      while ((match = pattern.exec(noteContent)) !== null) {
        const taskContent = match[1].trim()
        if (this.isTaskLike(taskContent)) {
          const task = this.createTask(taskContent, this.getContext(lines, match.index, noteContent), match[0])
          tasks.push(task)

          // Mark the original text in the processed note
          processedNote = processedNote.replace(match[0], `${match[0]} 🎯`)
        }
      }
    })

    // Extract tasks from sentences with task keywords
    const sentences = noteContent.split(/[.!?]+/)
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim()
      if (trimmed && this.containsTaskKeywords(trimmed) && !this.isAlreadyExtracted(trimmed, tasks)) {
        const task = this.createTask(this.cleanTaskContent(trimmed), this.getSentenceContext(sentences, index), trimmed)
        tasks.push(task)

        // Mark the sentence in the processed note
        if (processedNote.includes(trimmed)) {
          processedNote = processedNote.replace(trimmed, `${trimmed} 🎯`)
        }
      }
    })

    // Remove duplicates and sort by confidence
    const uniqueTasks = this.removeDuplicates(tasks)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10) // Limit to top 10 tasks

    return {
      tasks: uniqueTasks,
      processedNote,
    }
  }

  private static isTaskLike(content: string): boolean {
    const lowerContent = content.toLowerCase()

    // Check for task keywords
    if (this.containsTaskKeywords(lowerContent)) return true

    // Check for action verbs at the beginning
    const actionVerbs = [
      "create",
      "build",
      "fix",
      "update",
      "review",
      "schedule",
      "call",
      "email",
      "meet",
      "prepare",
      "finish",
      "complete",
      "implement",
      "design",
      "test",
      "deploy",
      "analyze",
      "research",
    ]
    const firstWord = lowerContent.split(" ")[0]
    if (actionVerbs.includes(firstWord)) return true

    // Check for imperative mood (starts with verb)
    const imperativePattern =
      /^(get|make|take|give|send|write|read|check|verify|confirm|approve|reject|submit|upload|download|install|configure|setup|organize|plan|book|reserve|order|buy|sell|pay|invoice|report|document|record|log|track|monitor|measure|evaluate|assess|audit|inspect|examine|investigate|explore|discover|learn|study|practice|exercise|train|teach|explain|demonstrate|present|show|tell|inform|notify|alert|remind|warn|advise|recommend|suggest|propose|request|ask|inquire|question|answer|respond|reply|acknowledge|thank|congratulate|celebrate|welcome|introduce|invite|attend|participate|join|leave|quit|resign|retire|hire|fire|promote|demote|transfer|relocate|move|travel|visit|tour|explore|navigate|drive|walk|run|exercise|workout|diet|eat|drink|sleep|rest|relax|meditate|pray|worship|volunteer|donate|contribute|support|help|assist|serve|provide|deliver|ship|transport|carry|lift|push|pull|drag|drop|place|put|set|arrange|organize|clean|wash|dry|iron|fold|pack|unpack|load|unload|fill|empty|open|close|lock|unlock|start|stop|pause|resume|continue|proceed|advance|progress|develop|improve|enhance|optimize|refine|polish|perfect|master|achieve|accomplish|succeed|win|lose|fail|try|attempt|effort|work|labor|toil|struggle|fight|battle|compete|race|challenge|test|experiment|trial|pilot|prototype|model|simulate|emulate|copy|duplicate|replicate|reproduce|repeat|retry|redo|undo|reverse|cancel|abort|quit|exit|escape|flee|run|hide|seek|find|search|hunt|track|follow|chase|pursue|catch|capture|grab|hold|keep|retain|maintain|preserve|protect|defend|guard|watch|observe|monitor|supervise|manage|control|direct|guide|lead|command|order|instruct|teach|train|coach|mentor|advise|counsel|consult|discuss|debate|argue|negotiate|bargain|deal|trade|exchange|swap|switch|change|alter|modify|adjust|adapt|customize|personalize|tailor|fit|match|align|balance|coordinate|synchronize|integrate|combine|merge|unite|join|connect|link|attach|fasten|secure|tie|bind|wrap|cover|protect|shield|hide|conceal|reveal|expose|display|show|present|exhibit|demonstrate|perform|act|play|sing|dance|draw|paint|sketch|design|create|build|construct|assemble|install|setup|configure|program|code|develop|debug|test|deploy|launch|release|publish|share|distribute|spread|broadcast|announce|declare|proclaim|state|say|speak|talk|communicate|express|convey|transmit|send|deliver|transport|carry|bring|take|fetch|retrieve|collect|gather|accumulate|store|save|preserve|archive|backup|restore|recover|repair|fix|mend|heal|cure|treat|diagnose|examine|inspect|check|verify|validate|confirm|approve|accept|reject|deny|refuse|decline|ignore|dismiss|discard|delete|remove|eliminate|destroy|demolish|break|damage|harm|hurt|injure|wound|kill|murder|assassinate|execute|punish|penalize|fine|charge|bill|invoice|pay|spend|invest|save|earn|make|gain|profit|lose|waste|squander|spend|consume|use|utilize|employ|apply|implement|execute|perform|operate|run|drive|pilot|navigate|steer|control|manage|handle|deal|cope|survive|endure|tolerate|accept|embrace|welcome|greet|meet|encounter|face|confront|challenge|oppose|resist|fight|battle|war|peace|negotiate|compromise|settle|resolve|solve|answer|respond|react|act|behave|conduct|perform|function|work|operate|run|go|come|arrive|depart|leave|stay|remain|wait|pause|stop|halt|cease|end|finish|complete|conclude|close|shut|open|begin|start|initiate|launch|introduce|present|offer|provide|give|grant|award|reward|prize|gift|present|donate|contribute|support|help|assist|aid|serve|benefit|advantage|profit|gain|win|succeed|achieve|accomplish|reach|attain|obtain|acquire|get|receive|accept|take|grab|seize|capture|catch|hold|keep|retain|maintain|preserve|protect|save|rescue|recover|restore|repair|fix|heal|cure|solve|resolve|settle|decide|choose|select|pick|opt|prefer|favor|like|love|enjoy|appreciate|value|treasure|cherish|adore|worship|respect|honor|admire|praise|compliment|thank|congratulate|celebrate|party|feast|dine|eat|drink|consume|taste|savor|enjoy|relish|delight|please|satisfy|fulfill|complete|finish|end|conclude|close|stop|halt|cease|pause|break|rest|relax|calm|soothe|comfort|console|reassure|encourage|motivate|inspire|influence|persuade|convince|convert|transform|change|alter|modify|adjust|adapt|improve|enhance|upgrade|update|renew|refresh|revive|restore|recover|heal|cure|fix|repair|mend|patch|seal|close|shut|lock|secure|protect|defend|guard|shield|cover|hide|conceal|mask|disguise|camouflage|blend|mix|combine|merge|unite|join|connect|link|attach|bind|tie|fasten|secure|anchor|dock|park|place|put|set|position|locate|situate|establish|found|create|build|construct|erect|raise|lift|elevate|boost|increase|grow|expand|extend|stretch|reach|touch|feel|sense|perceive|notice|observe|see|look|watch|view|examine|inspect|study|analyze|evaluate|assess|judge|rate|rank|score|grade|mark|label|tag|name|title|call|refer|mention|cite|quote|reference|source|credit|acknowledge|recognize|identify|distinguish|differentiate|separate|divide|split|break|crack|fracture|shatter|smash|crush|squeeze|press|push|pull|drag|haul|tow|carry|transport|move|shift|transfer|relocate|migrate|travel|journey|trip|visit|tour|explore|discover|find|locate|search|seek|hunt|track|trace|follow|pursue|chase|catch|capture|trap|snare|net|fish|hunt|shoot|fire|launch|throw|toss|pitch|cast|hurl|fling|sling|catapult|propel|drive|push|force|compel|urge|press|insist|demand|require|need|want|desire|wish|hope|expect|anticipate|predict|forecast|foresee|envision|imagine|dream|fantasize|visualize|picture|see|view|look|observe|watch|monitor|supervise|oversee|manage|control|direct|guide|lead|head|command|rule|govern|regulate|control|restrict|limit|constrain|confine|contain|hold|keep|retain|maintain|preserve|conserve|save|store|stockpile|hoard|collect|gather|accumulate|amass|pile|stack|heap|load|fill|stuff|pack|cram|squeeze|compress|condense|concentrate|focus|center|target|aim|point|direct|orient|align|position|place|put|set|arrange|organize|order|sort|classify|categorize|group|cluster|bunch|bundle|package|wrap|cover|enclose|surround|encircle|encompass|embrace|hug|hold|grasp|grip|clutch|clench|squeeze|pinch|twist|turn|rotate|spin|whirl|swirl|circle|orbit|revolve|cycle|repeat|iterate|loop|continue|proceed|advance|progress|move|go|travel|journey|walk|run|jog|sprint|dash|rush|hurry|speed|accelerate|quicken|hasten|expedite|facilitate|enable|allow|permit|authorize|approve|sanction|endorse|support|back|sponsor|fund|finance|invest|contribute|donate|give|grant|award|bestow|confer|present|offer|provide|supply|furnish|equip|outfit|dress|clothe|wear|don|put|place|set|position|locate|situate|establish|install|mount|attach|connect|join|link|bind|tie|fasten|secure|lock|close|shut|seal|cover|hide|conceal|protect|shield|defend|guard|watch|monitor|observe|see|look|view|examine|inspect|check|verify|confirm|validate|authenticate|certify|guarantee|assure|ensure|secure|protect|safeguard|preserve|maintain|keep|retain|hold|store|save|backup|archive|record|document|log|track|monitor|measure|gauge|assess|evaluate|analyze|study|research|investigate|explore|examine|inspect|review|audit|survey|poll|question|ask|inquire|interview|interrogate|quiz|test|examine|check|verify|confirm|validate|prove|demonstrate|show|display|exhibit|present|reveal|expose|uncover|discover|find|locate|identify|recognize|spot|notice|observe|see|detect|sense|feel|perceive|realize|understand|comprehend|grasp|get|catch|follow|track|trace|pursue|chase|hunt|search|seek|look|find|discover|uncover|reveal|expose|show|display|present|exhibit|demonstrate|prove|confirm|verify|validate|check|test|try|attempt|effort|endeavor|strive|struggle|fight|battle|compete|contest|challenge|oppose|resist|defend|protect|guard|shield|cover|hide|conceal|mask|disguise|camouflage|blend|mix|combine|merge|unite|join|connect|link|attach|bind|tie|fasten|secure|lock|close|shut|seal|open|unlock|unfasten|untie|unbind|disconnect|separate|divide|split|break|crack|fracture|shatter|destroy|demolish|ruin|wreck|damage|harm|hurt|injure|wound|bruise|cut|slice|chop|hack|slash|stab|pierce|puncture|poke|prod|push|shove|thrust|jab|strike|hit|beat|pound|hammer|bang|knock|tap|pat|touch|feel|handle|manipulate|operate|use|employ|utilize|apply|implement|execute|perform|do|make|create|build|construct|assemble|manufacture|produce|generate|develop|design|plan|prepare|organize|arrange|setup|configure|install|deploy|launch|start|begin|initiate|commence|open|activate|enable|turn|switch|flip|press|click|tap|touch|select|choose|pick|opt|decide|determine|resolve|settle|conclude|finish|complete|end|stop|halt|cease|pause|break|rest|wait|stay|remain|continue|proceed|go|move|travel|journey|walk|run|drive|fly|sail|swim|dive|jump|leap|hop|skip|dance|sing|play|perform|act|work|labor|toil|serve|help|assist|aid|support|back|sponsor|fund|finance|pay|spend|invest|save|earn|make|gain|win|lose|fail|succeed|achieve|accomplish|reach|attain|obtain|acquire|get|receive|accept|take|grab|seize|capture|catch|hold|keep|retain|maintain|preserve|protect|save|rescue|recover|restore|repair|fix|heal|cure|treat|help|assist|aid|support|serve|provide|supply|give|offer|present|deliver|hand|pass|transfer|send|ship|mail|post|publish|release|launch|introduce|present|show|display|exhibit|demonstrate|perform|execute|implement|apply|use|employ|utilize|operate|run|drive|control|manage|handle|deal|cope|survive|endure|last|persist|continue|remain|stay|wait|pause|stop|halt|cease|end|finish|complete|conclude|close|shut|lock|secure|protect|defend|guard|watch|observe|monitor|supervise|oversee|manage|control|direct|guide|lead|command|order|instruct|tell|say|speak|talk|communicate|express|convey|share|inform|notify|alert|warn|advise|recommend|suggest|propose|offer|present|give|provide|supply|deliver|serve|help|assist|support|back|endorse|approve|accept|agree|consent|permit|allow|enable|facilitate|encourage|motivate|inspire|influence|persuade|convince|convert|change|transform|alter|modify|adjust|adapt|improve|enhance|upgrade|update|renew|refresh|revive|restore|recover|heal|cure|fix|repair|solve|resolve|settle|decide|choose|select|pick|opt|prefer|like|love|enjoy|appreciate|value|treasure|cherish|respect|honor|admire|praise|thank|congratulate|celebrate|welcome|greet|meet|encounter|face|confront|challenge|test|try|attempt|experiment|explore|discover|learn|study|practice|train|exercise|work|play|rest|sleep|eat|drink|live|exist|be|become|grow|develop|evolve|progress|advance|move|go|come|arrive|leave|depart|stay|remain|wait|pause|stop|start|begin|end|finish)[\s]/i.test(
        lowerContent,
      )
    if (imperativePattern) return true

    // Check minimum length and structure
    return content.length > 10 && content.length < 200
  }

  private static containsTaskKeywords(content: string): boolean {
    const lowerContent = content.toLowerCase()
    return this.TASK_KEYWORDS.some((keyword) => lowerContent.includes(keyword.toLowerCase()))
  }

  private static createTask(content: string, context: string, originalText: string): ExtractedTask {
    const priority = this.determinePriority(content)
    const confidence = this.calculateConfidence(content, originalText)

    return {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: this.cleanTaskContent(content),
      priority,
      context: context.substring(0, 100) + (context.length > 100 ? "..." : ""),
      originalText,
      confidence,
    }
  }

  private static determinePriority(content: string): "high" | "medium" | "low" {
    const lowerContent = content.toLowerCase()

    for (const [priority, keywords] of Object.entries(this.PRIORITY_KEYWORDS)) {
      if (keywords.some((keyword) => lowerContent.includes(keyword))) {
        return priority as "high" | "medium" | "low"
      }
    }

    // Default priority based on urgency indicators
    if (/\b(today|now|immediately|urgent|asap)\b/i.test(content)) return "high"
    if (/\b(tomorrow|this week|soon|should)\b/i.test(content)) return "medium"
    return "low"
  }

  private static calculateConfidence(content: string, originalText: string): number {
    let confidence = 0.5 // Base confidence

    // Boost confidence for explicit task indicators
    if (/^[\s]*[-*•]\s+/m.test(originalText)) confidence += 0.3
    if (/^[\s]*\d+[.)]\s+/m.test(originalText)) confidence += 0.3
    if (/^[\s]*\[[\sx]\]\s+/m.test(originalText)) confidence += 0.4

    // Boost for task keywords
    const taskKeywordCount = this.TASK_KEYWORDS.filter((keyword) =>
      content.toLowerCase().includes(keyword.toLowerCase()),
    ).length
    confidence += Math.min(taskKeywordCount * 0.1, 0.3)

    // Boost for action verbs at start
    if (/^(create|build|fix|update|review|schedule|call|email|meet|prepare|finish|complete|implement)/i.test(content)) {
      confidence += 0.2
    }

    // Penalize for very short or very long content
    if (content.length < 15) confidence -= 0.2
    if (content.length > 150) confidence -= 0.1

    return Math.min(Math.max(confidence, 0), 1)
  }

  private static cleanTaskContent(content: string): string {
    return content
      .replace(/^[\s]*[-*•○→]\s+/gm, "") // Remove bullet points
      .replace(/^[\s]*\d+[.)]\s+/gm, "") // Remove numbers
      .replace(/^[\s]*\[[\sx]\]\s+/gm, "") // Remove checkboxes
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
  }

  private static getContext(lines: string[], matchIndex: number, fullText: string): string {
    // Find the line containing the match
    let currentPos = 0
    let lineIndex = 0

    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= matchIndex) {
        lineIndex = i
        break
      }
      currentPos += lines[i].length + 1 // +1 for newline
    }

    // Get surrounding context (1 line before and after)
    const contextLines = []
    if (lineIndex > 0) contextLines.push(lines[lineIndex - 1])
    contextLines.push(lines[lineIndex])
    if (lineIndex < lines.length - 1) contextLines.push(lines[lineIndex + 1])

    return contextLines.join(" ").trim()
  }

  private static getSentenceContext(sentences: string[], index: number): string {
    const contextSentences = []
    if (index > 0) contextSentences.push(sentences[index - 1])
    contextSentences.push(sentences[index])
    if (index < sentences.length - 1) contextSentences.push(sentences[index + 1])

    return contextSentences.join(". ").trim()
  }

  private static isAlreadyExtracted(content: string, existingTasks: ExtractedTask[]): boolean {
    const cleanContent = this.cleanTaskContent(content).toLowerCase()
    return existingTasks.some(
      (task) => task.content.toLowerCase().includes(cleanContent) || cleanContent.includes(task.content.toLowerCase()),
    )
  }

  private static removeDuplicates(tasks: ExtractedTask[]): ExtractedTask[] {
    const seen = new Set<string>()
    return tasks.filter((task) => {
      const key = task.content.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}
