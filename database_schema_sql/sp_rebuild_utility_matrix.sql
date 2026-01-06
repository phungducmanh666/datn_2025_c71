USE [recommendation_system]
GO

/****** Object:  StoredProcedure [dbo].[sp_rebuild_utility_matrix]    Script Date: 1/6/2026 7:27:41 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_rebuild_utility_matrix]
AS
BEGIN
  SET NOCOUNT ON; --- for what?
  SET XACT_ABORT ON; -- gặp lỗi sẽ tự động rollback khi rời TRY/CATCH

  BEGIN TRY
    BEGIN TRAN;--- ?

    -- 1) Tính dữ liệu nguồn vào bảng tạm
    IF OBJECT_ID('tempdb..#agg') IS NOT NULL DROP TABLE #agg;--- bảng tạm # và ##??
    SELECT
      b.customer_uuid AS user_uid,
      b.product_uuid  AS product_uid,
      CAST(SUM(b.star * b.number) AS decimal(10,4)) / NULLIF(SUM(b.number), 0) AS rating
    INTO #agg
    FROM (
      SELECT 
          t2.customer_uuid,
          t1.product_uuid,
          t1.number,
          t3.star
      FROM [LOCALHOST, 1433].[order].[dbo].[order_lines] AS t1
      INNER JOIN (
          SELECT uuid, customer_uuid
          FROM [LOCALHOST, 1433].[order].[dbo].[orders]
          WHERE status = 'SUCCESS'
      ) AS t2
        ON t1.order_uuid = t2.uuid
      INNER JOIN (
          SELECT order_line_uuid, star
          FROM [LOCALHOST, 1433].[order].[dbo].[reviews]
      ) AS t3
        ON t1.uuid = t3.order_line_uuid
    ) AS b
    GROUP BY b.customer_uuid, b.product_uuid;

    -- 2) Làm sạch bảng đích và nạp lại
    TRUNCATE TABLE dbo.utility_matrix;

    INSERT INTO dbo.utility_matrix (user_uid, product_uid, rating)
    SELECT user_uid, product_uid, rating
    FROM #agg
    WHERE rating IS NOT NULL;  -- tránh NaN khi SUM(number)=0

    COMMIT TRAN;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;

    -- Ném lại lỗi (để Agent/ứng dụng bắt được)
    THROW;
  END CATCH
END
GO


