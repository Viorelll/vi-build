namespace ViBuild.Application.Services.Interfaces;

public interface IAzureOpenAIService
{
    Task<(string Text, int Tokens)> CompleteAsync(string systemPrompt, string userPrompt);
}
