FROM public.ecr.aws/lambda/dotnet:6 AS base  
  
FROM mcr.microsoft.com/dotnet/sdk:6.0 as build  

WORKDIR /src  
COPY ["AWS.Prototyping.Pacman.Solver.csproj", "base/"]  
RUN dotnet restore "base/AWS.Prototyping.Pacman.Solver.csproj"  

WORKDIR "/src"  
COPY . .  
RUN dotnet build "AWS.Prototyping.Pacman.Solver.csproj" --configuration Release --output /app/build  

FROM build AS publish  
RUN dotnet publish "AWS.Prototyping.Pacman.Solver.csproj" \
            --output /app/publish \
            -p:PublishReadyToRun=false \
            -r linux-x64 \
            --self-contained true

FROM base AS final  
WORKDIR /var/task  
COPY --from=publish /app/publish .  
# COPY --from=publish ${LAMBDA_TASK_ROOT} .
CMD ["AWS.Prototyping.Pacman.Solver::AWS.Prototyping.Pacman.Solver.Function::FunctionHandler"] 