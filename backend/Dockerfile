
# -------- Base runtime image --------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
ENV ASPNETCORE_URLS=http://*:80
WORKDIR /app
EXPOSE 80

# -------- Build stage --------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY . ./
RUN dotnet restore ViBuild.slnx

# Copy the rest of the app and build
COPY . ./
RUN dotnet publish Web/ViBuild.Api/ViBuild.Api.csproj -c Release -o /app/publish

# -------- Final stage --------
FROM base AS final
WORKDIR /app

# Copy published output
COPY --from=build /app/publish .

# Run the app
ENTRYPOINT ["dotnet", "ViBuild.Api.dll"]
