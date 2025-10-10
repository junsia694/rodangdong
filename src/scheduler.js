import cron from 'node-cron';
import BlogAutomationApp from './index.js';
import { config } from './config/index.js';

/**
 * 스케줄러 모듈
 * CRON 기반 자동화 실행을 관리
 */

class BlogScheduler {
  constructor() {
    this.app = new BlogAutomationApp();
    this.cronJob = null;
    this.isRunning = false;
  }

  /**
   * CRON 작업 시작
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler is already running');
      return;
    }

    console.log('🕐 Starting Blog Automation Scheduler...');
    console.log(`📅 Schedule: ${config.schedule.cronSchedule}`);
    console.log(`⏰ Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

    // CRON 작업 생성 및 시작
    this.cronJob = cron.schedule(config.schedule.cronSchedule, async () => {
      await this.executeScheduledRun();
    }, {
      scheduled: false, // 수동으로 시작
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    this.cronJob.start();
    this.isRunning = true;

    console.log('✅ Scheduler started successfully');
    console.log('📝 Next runs will be logged with timestamps');
  }

  /**
   * CRON 작업 중지
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Scheduler is not running');
      return;
    }

    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }

    this.isRunning = false;
    console.log('🛑 Scheduler stopped');
  }

  /**
   * 예약된 실행 수행
   */
  async executeScheduledRun() {
    const startTime = new Date();
    console.log(`\n🚀 Scheduled run started at: ${startTime.toISOString()}`);

    try {
      // 애플리케이션 실행
      const results = await this.app.run({
        maxKeywords: 3, // 스케줄된 실행에서는 3개 키워드만 처리
        mode: 'harvest'
      });

      const endTime = new Date();
      const duration = endTime - startTime;

      console.log(`⏱️  Scheduled run completed in ${Math.round(duration / 1000)}s`);
      console.log(`📊 Processed ${results.length} keywords`);

      // 성공/실패 통계
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        console.log(`✅ Successfully processed: ${successful} keywords`);
      }
      
      if (failed > 0) {
        console.log(`❌ Failed to process: ${failed} keywords`);
      }

      // 다음 실행 시간 계산
      this.logNextRunTime();

    } catch (error) {
      console.error(`💥 Scheduled run failed: ${error.message}`);
      console.error('Stack trace:', error.stack);
    }
  }

  /**
   * 다음 실행 시간 로깅
   */
  logNextRunTime() {
    if (this.cronJob) {
      const nextRun = this.cronJob.nextDate();
      if (nextRun) {
        console.log(`⏰ Next scheduled run: ${nextRun.toISOString()}`);
      }
    }
  }

  /**
   * 즉시 실행 (스케줄 대기 없이)
   */
  async runNow() {
    console.log('🏃‍♂️ Running automation immediately...');
    await this.executeScheduledRun();
  }

  /**
   * 스케줄러 상태 조회
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      cronSchedule: config.schedule.cronSchedule,
      nextRun: this.cronJob ? this.cronJob.nextDate() : null,
      appStatus: this.app.getStatus()
    };
  }

  /**
   * 스케줄 변경
   * @param {string} newSchedule - 새로운 CRON 스케줄
   */
  updateSchedule(newSchedule) {
    if (!cron.validate(newSchedule)) {
      throw new Error('Invalid CRON schedule format');
    }

    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      this.stop();
    }

    config.schedule.cronSchedule = newSchedule;
    
    if (wasRunning) {
      this.start();
    }

    console.log(`📅 Schedule updated to: ${newSchedule}`);
  }
}

/**
 * CLI 인터페이스
 */
class SchedulerCLI {
  constructor() {
    this.scheduler = new BlogScheduler();
    this.setupSignalHandlers();
  }

  /**
   * 시그널 핸들러 설정 (Graceful shutdown)
   */
  setupSignalHandlers() {
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      this.scheduler.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  }

  /**
   * CLI 명령 처리
   */
  async handleCommand() {
    const command = process.argv[2];

    switch (command) {
      case 'start':
        this.scheduler.start();
        
        // 프로세스를 계속 실행
        console.log('🔄 Scheduler is running. Press Ctrl+C to stop.');
        break;

      case 'stop':
        this.scheduler.stop();
        process.exit(0);
        break;

      case 'run-now':
        await this.scheduler.runNow();
        process.exit(0);
        break;

      case 'status':
        const status = this.scheduler.getStatus();
        console.log('\n📊 Scheduler Status:');
        console.log(`Running: ${status.isRunning}`);
        console.log(`Schedule: ${status.cronSchedule}`);
        console.log(`Next Run: ${status.nextRun ? status.nextRun.toISOString() : 'N/A'}`);
        console.log(`App Status:`, status.appStatus);
        process.exit(0);
        break;

      case 'test':
        console.log('🧪 Running test execution...');
        await this.scheduler.runNow();
        process.exit(0);
        break;

      default:
        this.showHelp();
        process.exit(1);
    }
  }

  /**
   * 도움말 표시
   */
  showHelp() {
    console.log(`
📚 Blog Automation Scheduler CLI

Usage: node src/scheduler.js <command>

Commands:
  start      Start the scheduler (runs continuously)
  stop       Stop the scheduler
  run-now    Execute automation immediately
  status     Show current scheduler status
  test       Run a test execution
  help       Show this help message

Examples:
  node src/scheduler.js start
  node src/scheduler.js run-now
  node src/scheduler.js status

Environment Variables:
  CRON_SCHEDULE     Cron schedule (default: "0 */3 * * *")
  GEMINI_API_KEY    Gemini API key (required)
  BLOGGER_BLOG_ID   Blogger blog ID (required)
  GOOGLE_CLIENT_ID  Google OAuth client ID
  GOOGLE_CLIENT_SECRET Google OAuth client secret
  GOOGLE_REFRESH_TOKEN Google OAuth refresh token
`);
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const cli = new SchedulerCLI();
  
  try {
    await cli.handleCommand();
  } catch (error) {
    console.error('💥 CLI execution failed:', error);
    process.exit(1);
  }
}

// 직접 실행된 경우에만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { BlogScheduler, SchedulerCLI };
