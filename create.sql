CREATE TABLE [dbo].[QuestionnaireQuestion](
	[FormID] [varchar](10) NOT NULL,
	[QuID] [int] NOT NULL,
	[Type] [varchar](10) NULL CHECK(type IN ('header','menu','text','checkbox','textarea','radio','text5')),
	[QuestionText] [varchar](8000) NULL,
	[Required] [bit] NULL,
 CONSTRAINT [PK_QuestionnaireQuestion] PRIMARY KEY CLUSTERED 
(
	[FormID] ASC,
	[QuID] ASC
)
)
GO
CREATE TABLE [dbo].[QuestionnaireAnswer](
	[FormID] [varchar](10) NOT NULL,
	[QuID] [int] NOT NULL,
	[OptionNum] [int] NOT NULL,
	[Name] [varchar](50) NULL,
	[AnswerText] [varchar](8000) NULL,
 CONSTRAINT [PK_QuestionnaireAnswer] PRIMARY KEY CLUSTERED 
(
	[FormID] ASC,
	[QuID] ASC,
	[OptionNum] ASC
)	
) 
GO
CREATE VIEW [dbo].[QuestionnaireQandA] AS 
SELECT FormID,QuID,Type,
CASE  Type
WHEN 'header' THEN 'hidden'
WHEN 'text5' THEN 
  CASE WHEN OptionNum = 0 THEN 'hidden' ELSE 'text' END
WHEN 'menu' THEN 'radio'
ELSE Type END As InputType,
CASE WHEN Type = 'text5' THEN
  CASE WHEN OptionNum = 0 THEN QuestionText ELSE OptionNum + ')' END
WHEN OptionNum = 1 THEN QuestionText 
END AS QuestionText,
OptionNum,Name,AnswerText,Required,IsMenu
FROM (
	SELECT qa.FormID,QuID,Type,QuestionText,
	ISNULL(ISNULL(cnt5, OptionNum),1) AS OptionNum,
	Name,AnswerText,Required,
	CASE WHEN menu.FormID IS NULL THEN 0 ELSE 1 END AS IsMenu 
	FROM (
		SELECT q.FormID, q.QuID, q.Type, q.QuestionText, 
		q.Required, a.OptionNum, a.Name, a.AnswerText
		FROM QuestionnaireQuestion q 
		LEFT OUTER JOIN QuestionnaireAnswer a
		ON q.FormID = a.FormID 
		AND q.QuID = a.QuID
	) AS qa
	LEFT JOIN (
		SELECT 'text5' AS typ5, '0' AS cnt5
		UNION SELECT 'text5', '1'
		UNION SELECT 'text5', '2'
		UNION SELECT 'text5', '3' 
		UNION SELECT 'text5', '4' 
		UNION SELECT 'text5', '5' 
	) AS cntr
	ON cntr.typ5 = Type
	LEFT JOIN (
		SELECT distinct FormID
		FROM QuestionnaireQuestion
		WHERE Type = 'menu'
		GROUP BY FormID
	) AS menu
	ON menu.FormID = qa.FormID
) as ii
--ORDER BY FormID, QuID, OptionNum
