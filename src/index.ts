import { Context, Schema, Logger } from 'koishi'

import find from 'puppeteer-finder';
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export const name = 'lmsys-claude-2'
export const logger = new Logger('lmsysClaude2.0')
export const reusable = true
export const usage = `## 🎮 使用

- 建议为指令添加指令别名
- 随开随用（自备科学上网工具咯），确保你能打开并正常使用 [lmsys](https://chat.lmsys.org/) 进行对话。
- 只能同时服务一整个对话（不分群），如需分群多开，可以多次添加本插件配置，并为相应的群聊设置单独的过滤器，参考链接：[维护多份配置](https://koishi.chat/zh-CN/manual/recipe/multiple.html#%E5%A4%9A%E5%AE%9E%E4%BE%8B)。

## 📝 指令说明

- \`lmsysClaude\`：显示 lmsysClaude 指令帮助
- \`lmsysClaude.clearHistory\`：清除对话历史
- \`lmsysClaude.regenerate\`：重新回答
- \`lmsysClaude.modelList\`：模型列表
- \`lmsysClaude.chat <prompt:text>\`：对话
- \`lmsysClaude.switchingModel <model:text>\`：切换模型`

export interface Config {
  Model
  Temperature
}

export const Config: Schema<Config> = Schema.object({
  Model: Schema.union(['mixtral-8x7b-instruct-v0.1', 'mistral-7b-instruct', 'gemini-pro', 'solar-10.7b-instruct-v1.0', 'gpt-3.5-turbo-0613', 'gpt-3.5-turbo-1106', 'gpt-4-turbo', 'dolphin-2.2.1-mistral-7b', 'claude-2.1', 'claude-2.0', 'claude-instant-1', 'pplx-70b-online', 'pplx-7b-online', 'openhermes-2.5-mistral-7b', 'starling-lm-7b-alpha', 'tulu-2-dpo-70b', 'yi-34b-chat', 'vicuna-33b', 'vicuna-13b', 'llama-2-70b-chat', 'llama-2-13b-chat', 'llama-2-7b-chat', 'chatglm3-6b', 'openchat-3.5', 'zephyr-7b-beta', 'qwen-14b-chat', 'codellama-34b-instruct', 'wizardlm-70b', 'falcon-180b-chat']).default('claude-2.0').description('选择一种聊天模型。注意，修改配置后请重载插件，否则不生效。'),
  Temperature: Schema.number().role('slider').min(0).max(1).step(0.1).default(1).description('模型的温度。注意，修改配置后请重载插件，否则不生效。'),
})

const executablePath = find();
puppeteer.use(StealthPlugin())

var isReplying: boolean
const models = [
  'mixtral-8x7b-instruct-v0.1',
  'mistral-7b-instruct',
  'gemini-pro',
  'solar-10.7b-instruct-v1.0',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-1106',
  'gpt-4-turbo',
  'dolphin-2.2.1-mistral-7b',
  'claude-2.1',
  'claude-2.0',
  'claude-instant-1',
  'pplx-70b-online',
  'pplx-7b-online',
  'openhermes-2.5-mistral-7b',
  'starling-lm-7b-alpha',
  'tulu-2-dpo-70b',
  'yi-34b-chat',
  'vicuna-33b',
  'vicuna-13b',
  'llama-2-70b-chat',
  'llama-2-13b-chat',
  'llama-2-7b-chat',
  'chatglm3-6b',
  'openchat-3.5',
  'zephyr-7b-beta',
  'qwen-14b-chat',
  'codellama-34b-instruct',
  'wizardlm-70b',
  'falcon-180b-chat'
];

export async function apply(ctx: Context, config: Config) {
  const { Model, Temperature } = config
  logger.info('正在初始化中.......')
  const { browser, page } = await openWebPage(ctx, Model, Temperature)
  logger.info('初始化成功！')

  function waitForTargetElement(selector: string, countThreshold: number) {
    return page.waitForFunction((selector, countThreshold) => {
      const elements = document.querySelectorAll(selector);
      return elements.length >= countThreshold;
    }, { timeout: 0 }, selector, countThreshold);
  }

  async function handleCommandClickButton(session, command: string, buttonSelector: string) {
    await session.send('嗯~');
    await page.waitForSelector(buttonSelector);
    await page.click(buttonSelector);
    isReplying = true;
    await page.waitForTimeout(1000);
    await waitForTargetElement('div.wrap.default.minimal.svelte-zlszon.translucent.hide', 3);
    isReplying = false;
  }

  async function handleCommandChat(session, prompt: string) {
    await session.send('嗯~');
    const output = removeNewlines(prompt);
    const textareaElements = await page.$$('textarea[data-testid="textbox"]');
    const targetTextareaElement = textareaElements[2];
    await targetTextareaElement.click();
    await targetTextareaElement.type(output);
    await targetTextareaElement.press('Enter');
    isReplying = true;
    await page.waitForTimeout(1000);
    await waitForTargetElement('div.wrap.default.minimal.svelte-zlszon.translucent.hide', 3);
    isReplying = false;
    await session.send(await getBotReplyText());
  }

  async function getBotReplyText() {
    const botReplySelector = 'div.message.bot.svelte-175fbmp.latest';
    await page.waitForSelector(botReplySelector, { visible: true });
    return await page.$eval(botReplySelector, (element) => element.textContent);
  }

  ctx.command('lmsysClaude', 'lmsysClaude 指令帮助').action(async ({ session }) => {
    await session.execute(`lmsysClaude -h`);
  });

  ctx.command('lmsysClaude.clearHistory', '清除对话历史').action(async ({ session }) => {
    if (isReplying) {
      return '等一下啦~';
    }
    await handleCommandClickButton(session, 'lmsysClaude.clearHistory', '#component-96');
    await session.send('好啦~');
  });

  ctx.command('lmsysClaude.regenerate', '重新回答').action(async ({ session }) => {
    if (isReplying) {
      return '等一下啦~';
    }
    await handleCommandClickButton(session, 'lmsysClaude.regenerate', '#component-95');
    const text = await getBotReplyText();
    await session.send(text);
  });

  ctx.command('lmsysClaude.modelList', '模型列表').action(async ({ session }) => {
    await session.send(`${models.map((model, index) => `${index + 1}. ${model}`).join('\n')}`);
  });

  ctx.command('lmsysClaude.chat <prompt:text>', '对话').action(async ({ session }, prompt) => {
    if (!prompt) {
      return '大笨蛋~';
    }
    if (isReplying) {
      return '等一下啦~';
    }
    await handleCommandChat(session, prompt);
  });

  function isModelValid(model: string): boolean {
    return models.includes(model);
  }

  ctx.command('lmsysClaude.switchingModel <model:text>', '切换模型').action(async ({ session }, model) => {
    if (!model) {
      return '大笨蛋~';
    }
    if (isReplying) {
      return '等一下啦~';
    }
    await session.send('嗯~');
    isReplying = true;

    if (isModelValid(model)) {
      await switchingModel(page, model);
      await session.send('好啦~');
    } else {
      await session.send('无效的模型');
    }

    isReplying = false;
  });

  ctx.on('dispose', async () => {
    await browser.close();
  });
}

async function openWebPage(ctx: Context, model, temperature) {
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new'
    // headless: false
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });
  await page.goto('https://chat.lmsys.org/');
  await page.on('dialog', async dialog => {
    // logger.info(dialog.message()); //打印出弹框的信息
    // logger.info(dialog.type()); //打印出弹框的类型，是alert、confirm、prompt哪种
    // logger.info(dialog.defaultValue()); //打印出默认的值只有 prompt 弹框才有
    await dialog.dismiss();
    // await dialog.accept('demo'); // accept函数也是可以的呢，可以向 prompt 弹框输入文字
  });

  await page.waitForSelector('.tab-nav button');

  await page.waitForTimeout(5000);

  const buttonSelector = '.tab-nav button';
  const directChatButtonSelector = `${buttonSelector}:nth-child(3)`;
  await page.click(directChatButtonSelector);

  await switchingModel(page, model)

  await page.waitForSelector('.icon.svelte-s1r2yt');

  const elements = await page.$$('.icon.svelte-s1r2yt');
  await elements[5].click();

  await page.waitForTimeout(1000);

  await page.waitForSelector('input[data-testid="number-input"]');

  const inputElements2 = await page.$$('input[data-testid="number-input"]');
  const seventhInputElement = inputElements2[6];

  await seventhInputElement.click();

  await page.keyboard.down('Control');
  await page.keyboard.press('a');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');

  await page.keyboard.type(`${temperature}`);

  await page.keyboard.press('Enter');

  return { browser, page }
}

function removeNewlines(str: string): string {
  return str.replace(/\n/g, '');
}

async function switchingModel(page, model: string) {
  await page.waitForSelector('button.selected.svelte-kqij2n');
  await page.waitForTimeout(1000);

  const inputElements = await page.$$('.border-none');

  const targetInputElement = inputElements[2];

  await targetInputElement.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');

  await targetInputElement.type(`${model}`);

  await targetInputElement.press('Enter');

  await page.waitForTimeout(2000);
}
