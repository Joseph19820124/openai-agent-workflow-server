export interface Skill {
  name: string;
  description: string;
  instruction: string;
  examples?: string[];
  constraints?: string[];
  applicableEvents?: string[];
}

// Built-in skills
const SKILLS: Skill[] = [
  {
    name: 'Issue Triage',
    description: 'Automatically triage and label incoming issues',
    instruction: `When a new issue is opened, analyze its content and:
1. Determine the issue type (bug, feature request, question, documentation)
2. Assess the priority based on impact and urgency
3. Add appropriate labels
4. If needed, add a helpful comment acknowledging the issue`,
    examples: [
      'Bug reports should get "bug" label and priority assessment',
      'Feature requests should get "enhancement" label',
      'Questions should get "question" label and may need redirection to discussions'
    ],
    constraints: [
      'Do not close issues automatically',
      'Be polite and welcoming in all comments',
      'When in doubt, use lower priority labels'
    ],
    applicableEvents: ['issues']
  },
  {
    name: 'PR Review Helper',
    description: 'Assist with pull request reviews',
    instruction: `When a pull request is opened or updated:
1. Check the PR description for completeness
2. Identify the type of change (bugfix, feature, refactor, docs)
3. Add relevant labels
4. Leave a welcoming comment if it's a new contributor`,
    examples: [
      'PRs fixing bugs should get "bugfix" label',
      'PRs with breaking changes should get "breaking-change" label',
      'First-time contributors should receive a welcome message'
    ],
    constraints: [
      'Do not approve or reject PRs automatically',
      'Do not merge PRs',
      'Be constructive and helpful in feedback'
    ],
    applicableEvents: ['pull_request']
  },
  {
    name: 'Ping Response',
    description: 'Respond to webhook ping events',
    instruction: `When receiving a ping event, acknowledge the webhook is properly configured.`,
    examples: [],
    constraints: [],
    applicableEvents: ['ping']
  }
];

export class SkillsLoader {
  private skills: Skill[] = SKILLS;

  getAllSkills(): Skill[] {
    return this.skills;
  }

  getSkillByName(name: string): Skill | undefined {
    return this.skills.find(s => s.name === name);
  }

  getSkillsForEvent(event: string): Skill[] {
    return this.skills.filter(
      s => !s.applicableEvents || s.applicableEvents.includes(event)
    );
  }

  addSkill(skill: Skill): void {
    this.skills.push(skill);
  }

  removeSkill(name: string): boolean {
    const index = this.skills.findIndex(s => s.name === name);
    if (index !== -1) {
      this.skills.splice(index, 1);
      return true;
    }
    return false;
  }
}
