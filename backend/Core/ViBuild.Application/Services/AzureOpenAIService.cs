using Azure;
using Azure.AI.OpenAI;
using Microsoft.Extensions.Configuration;
using OpenAI.Chat;
using System.ClientModel;
using ViBuild.Application.Services.Interfaces;

namespace ViBuild.Application.Services;

public class AzureOpenAIService : IAzureOpenAIService
{
    private readonly ChatClient _chatClient;
    private readonly string _deployment;
    private readonly string _endpoint;

    public AzureOpenAIService(IConfiguration configuration)
    {
        _endpoint = configuration["AzureOpenAI:Endpoint"]
            ?? throw new InvalidOperationException("AzureOpenAI:Endpoint is not configured.");
        var apiKey = configuration["AzureOpenAI:ApiKey"]
            ?? throw new InvalidOperationException("AzureOpenAI:ApiKey is not configured.");
        _deployment = configuration["AzureOpenAI:DeploymentName"]
            ?? throw new InvalidOperationException("AzureOpenAI:DeploymentName is not configured.");

        var client = new AzureOpenAIClient(new Uri(_endpoint), new AzureKeyCredential(apiKey));
        _chatClient = client.GetChatClient(_deployment);
    }

    public async Task<(string Text, int Tokens)> CompleteAsync(string systemPrompt, string userPrompt)
    {
        List<ChatMessage> messages =
        [
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(userPrompt)
        ];

        try
        {
            ChatCompletion completion = await _chatClient.CompleteChatAsync(messages);

            return (completion.Content[0].Text, completion.Usage.TotalTokenCount);
        }
        catch (ClientResultException ex) when (ex.Status == 404)
        {
            throw new InvalidOperationException(
                $"Azure OpenAI deployment '{_deployment}' was not found at '{_endpoint}'. " +
                $"Go to Azure OpenAI Studio → Deployments and set AzureOpenAI:DeploymentName " +
                $"in appsettings.json to the exact deployment name.", ex);
        }
        catch (ClientResultException ex) when (ex.Status == 401)
        {
            throw new InvalidOperationException(
                $"Azure OpenAI authentication failed for endpoint '{_endpoint}'. " +
                $"Check AzureOpenAI:ApiKey in appsettings.json.", ex);
        }
    }
}
