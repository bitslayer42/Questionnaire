<cfsetting enablecfoutputonly="true">

<cfquery name="QandA" datasource="intranet-sql">
SELECT FormID,QuID,Type,InputType,QuestionText
,OptionNum,Name,AnswerText,Required,IsMenu
FROM QuestionnaireQandA
ORDER BY FormID, QuID, OptionNum
</cfquery>


<cfcontent type="application/json" reset="yes">

<cfset loopctr = 1>
<cfoutput>[</cfoutput>
<cfoutput query="QandA">
{
"FormID":"#QandA.FormID#",
"QuID":"#QandA.QuID#",
"Type":"#QandA.Type#",
"InputType":"#QandA.InputType#",
"QuestionText":"#QandA.QuestionText#",
"OptionNum":"#QandA.OptionNum#",
"Name":"#QandA.Name#",
"AnswerText":"#QandA.AnswerText#",
"Required":"#QandA.Required#",
"IsMenu":"#QandA.IsMenu#"
}
<cfif loopctr NEQ QandA.RecordCount>,</cfif>
<cfset loopctr = loopctr + 1>
</cfoutput>
<cfoutput>]</cfoutput>




