ALTER TABLE `companies` ADD `sort` integer DEFAULT 1000;
--> statement-breakpoint
-- 回填已有公司的排序权重（新势力靠前，与 src/constants/models.ts 保持一致）
UPDATE `companies` SET `sort` = CASE `name`
  WHEN '深度求索 (DeepSeek)' THEN 10
  WHEN 'MiniMax' THEN 20
  WHEN '智谱AI' THEN 30
  WHEN '月之暗面' THEN 40
  WHEN '阶跃星辰' THEN 50
  WHEN '百川智能' THEN 60
  WHEN '零一万物' THEN 70
  WHEN '字节跳动' THEN 80
  WHEN '阿里巴巴' THEN 90
  WHEN '百度' THEN 100
  WHEN '腾讯' THEN 110
  WHEN '华为' THEN 120
  WHEN '科大讯飞' THEN 130
  WHEN '360' THEN 140
  WHEN '小米' THEN 150
  WHEN '商汤科技' THEN 160
  WHEN '美团' THEN 170
  WHEN '京东' THEN 180
  WHEN '面壁智能' THEN 190
  ELSE `sort`
END;
