import OpenAI from 'openai';
import { SkillsLoader, Skill } from '../skills/loader';
import { GitHubTools } from '../tools/github';

export interface AgentState {
  goal: string;
  currentStep: number;
  context: Record<string, unknown>;
  completed: boolean;
}

export class AgentRunner {
  private openai: OpenAI;
  private skillsLoader: SkillsLoader;
  private githubTools: GitHubTools;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.LLM_API_KEY,
      baseURL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
    });
    this.skillsLoader = new SkillsLoader();
    this.githubTools = new GitHubTools();
  }

  async processWebhookEvent(event: string, payload: unknown): Promise<Record<string, unknown>> {
    // Determine which skills to load based on the event
    const skills = this.skillsLoader.getSkillsForEvent(event);

    // Build the system prompt with loaded skills
    const systemPrompt = this.buildSystemPrompt(skills);

    // Get available tools
    const tools = this.getAvailableTools();

    // Create the initial message
    const userMessage = this.formatEventMessage(event, payload);

    console.log(`Processing event with ${skills.length} skills loaded`);

    // Run the agent loop
    const result = await this.runAgentLoop(systemPrompt, userMessage, tools);

    return result;
  }

  private buildSystemPrompt(skills: Skill[]): string {
    let prompt = `You are an Agent Workflow Server that processes GitHub events and takes appropriate actions.

Your responsibilities:
1. Understand the incoming event
2. Decide what actions to take
3. Execute actions using the available tools
4. Report the results

`;

    // Add loaded skills
    if (skills.length > 0) {
      prompt += `\n## Loaded Skills\n\n`;
      for (const skill of skills) {
        prompt += `### ${skill.name}\n`;
        prompt += `${skill.instruction}\n\n`;
        if (skill.examples && skill.examples.length > 0) {
          prompt += `Examples:\n`;
          for (const example of skill.examples) {
            prompt += `- ${example}\n`;
          }
          prompt += '\n';
        }
        if (skill.constraints && skill.constraints.length > 0) {
          prompt += `Constraints:\n`;
          for (const constraint of skill.constraints) {
            prompt += `- ${constraint}\n`;
          }
          prompt += '\n';
        }
      }
    }

    return prompt;
  }

  private getAvailableTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'add_comment',
          description: 'Add a comment to a GitHub issue or pull request',
          parameters: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              issue_number: { type: 'number', description: 'Issue or PR number' },
              body: { type: 'string', description: 'Comment body' }
            },
            required: ['owner', 'repo', 'issue_number', 'body']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'add_label',
          description: 'Add a label to a GitHub issue or pull request',
          parameters: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              issue_number: { type: 'number', description: 'Issue or PR number' },
              labels: { type: 'array', items: { type: 'string' }, description: 'Labels to add' }
            },
            required: ['owner', 'repo', 'issue_number', 'labels']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_file_content',
          description: 'Get the content of a file from a GitHub repository',
          parameters: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              path: { type: 'string', description: 'File path' },
              ref: { type: 'string', description: 'Git ref (branch, tag, or commit)' }
            },
            required: ['owner', 'repo', 'path']
          }
        }
      }
    ];
  }

  private formatEventMessage(event: string, payload: unknown): string {
    const p = payload as Record<string, unknown>;

    switch (event) {
      case 'issues':
        return `GitHub Issue Event:
Action: ${p.action}
Issue #${(p.issue as Record<string, unknown>)?.number}: ${(p.issue as Record<string, unknown>)?.title}
Repository: ${(p.repository as Record<string, unknown>)?.full_name}
Body: ${(p.issue as Record<string, unknown>)?.body || 'No description'}`;

      case 'pull_request':
        return `GitHub Pull Request Event:
Action: ${p.action}
PR #${(p.pull_request as Record<string, unknown>)?.number}: ${(p.pull_request as Record<string, unknown>)?.title}
Repository: ${(p.repository as Record<string, unknown>)?.full_name}
Body: ${(p.pull_request as Record<string, unknown>)?.body || 'No description'}`;

      case 'push':
        return `GitHub Push Event:
Repository: ${(p.repository as Record<string, unknown>)?.full_name}
Ref: ${p.ref}
Commits: ${(p.commits as unknown[])?.length || 0}`;

      case 'ping':
        return `GitHub Ping Event:
Repository: ${(p.repository as Record<string, unknown>)?.full_name}
Zen: ${p.zen}`;

      default:
        return `GitHub ${event} Event:\n${JSON.stringify(payload, null, 2)}`;
    }
  }

  private async runAgentLoop(
    systemPrompt: string,
    userMessage: string,
    tools: OpenAI.Chat.Completions.ChatCompletionTool[]
  ): Promise<Record<string, unknown>> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const maxIterations = 5;
    let iteration = 0;
    const actions: Record<string, unknown>[] = [];

    while (iteration < maxIterations) {
      iteration++;
      console.log(`Agent loop iteration ${iteration}/${maxIterations}`);

      const response = await this.openai.chat.completions.create({
        model: process.env.LLM_MODEL || 'openai/gpt-5.2-codex',
        messages,
        tools,
        tool_choice: 'auto'
      });

      const assistantMessage = response.choices[0].message;
      console.log(`LLM response received. Content: ${assistantMessage.content?.substring(0, 200) || '(no content)'}`);
      console.log(`Tool calls: ${assistantMessage.tool_calls?.length || 0}`);
      messages.push(assistantMessage);

      // Check if agent wants to use tools
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          console.log(`Executing tool: ${toolCall.function.name}`);
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`Tool args: ${JSON.stringify(args)}`);
          let result: unknown;

          try {
            switch (toolCall.function.name) {
              case 'add_comment':
                result = await this.githubTools.addComment(
                  args.owner,
                  args.repo,
                  args.issue_number,
                  args.body
                );
                break;
              case 'add_label':
                result = await this.githubTools.addLabel(
                  args.owner,
                  args.repo,
                  args.issue_number,
                  args.labels
                );
                break;
              case 'get_file_content':
                result = await this.githubTools.getFileContent(
                  args.owner,
                  args.repo,
                  args.path,
                  args.ref
                );
                break;
              default:
                result = { error: `Unknown tool: ${toolCall.function.name}` };
            }
          } catch (error) {
            console.error(`Tool execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            result = { error: error instanceof Error ? error.message : 'Unknown error' };
          }

          console.log(`Tool result: ${JSON.stringify(result)}`);
          actions.push({
            tool: toolCall.function.name,
            args,
            result
          });

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          });
        }
      } else {
        // No more tool calls, agent is done
        console.log(`Agent completed after ${iteration} iterations with ${actions.length} actions`);
        return {
          message: assistantMessage.content,
          actions,
          iterations: iteration
        };
      }
    }

    console.log(`Agent reached max iterations (${maxIterations}) with ${actions.length} actions`);
    return {
      message: 'Max iterations reached',
      actions,
      iterations: iteration
    };
  }
}
