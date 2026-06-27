import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import PromptTemplate
from colorama import Fore, Style, init
from agent.tools import search_affordable_neighborhoods, query_openstreetmap_amenities
from agent.prompts import SYSTEM_PROMPT

load_dotenv()
init(autoreset=True)

TOOLS = [search_affordable_neighborhoods, query_openstreetmap_amenities]

REACT_TEMPLATE = """{system_prompt}

You have access to the following tools:
{tools}

Use the following format EXACTLY:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}
"""


def build_agent() -> AgentExecutor:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found. Please add it to Replit Secrets.")

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=api_key,
        temperature=0.2,
    )

    prompt = PromptTemplate(
        input_variables=["input", "agent_scratchpad", "tools", "tool_names", "system_prompt"],
        template=REACT_TEMPLATE,
    )

    agent = create_react_agent(
        llm=llm,
        tools=TOOLS,
        prompt=prompt,
    )

    executor = AgentExecutor(
        agent=agent,
        tools=TOOLS,
        verbose=True,
        max_iterations=8,
        handle_parsing_errors=True,
        return_intermediate_steps=False,
    )

    return executor


def run_query(query: str) -> str:
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"  QUERY: {query}")
    print(f"{'='*60}{Style.RESET_ALL}\n")

    try:
        executor = build_agent()
        result = executor.invoke({
            "input": query,
            "system_prompt": SYSTEM_PROMPT,
        })
        answer = result.get("output", "No answer returned.")
        print(f"\n{Fore.GREEN}FINAL ANSWER:{Style.RESET_ALL}\n{answer}\n")
        return answer
    except Exception as e:
        error_msg = f"Agent error: {str(e)}"
        print(f"{Fore.RED}{error_msg}{Style.RESET_ALL}")
        return error_msg
