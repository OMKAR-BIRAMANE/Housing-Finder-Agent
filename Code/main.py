from agent.agent_runner import run_query
from colorama import Fore, Style, init

init(autoreset=True)


def print_banner():
    print(f"{Fore.CYAN}")
    print("  ╔══════════════════════════════════════════════════════╗")
    print("  ║     CHICAGO AFFORDABLE HOUSING FINDER               ║")
    print("  ║     Powered by LangChain + Gemini AI                ║")
    print("  ╚══════════════════════════════════════════════════════╝")
    print(f"{Style.RESET_ALL}")


def run_demo_queries():
    queries = [
        "I can only afford $1,200 a month in rent in Chicago. I don't have a car, "
        "so I need to live near a train and a grocery store. What neighborhood do you recommend?",

        "I'm a family of four with a budget of $1,100/month. Safety is important to us. "
        "Which Chicago neighborhoods are affordable and have low crime rates?",

        "I'm a graduate student with a $1,500/month budget. I want to live somewhere with "
        "good amenities and decent safety. What are my best options in Chicago?",
    ]

    for i, query in enumerate(queries, 1):
        print(f"\n{Fore.MAGENTA}{'─'*60}")
        print(f"  DEMO QUERY #{i}")
        print(f"{'─'*60}{Style.RESET_ALL}")
        run_query(query)
        print()


def interactive_mode():
    print(f"\n{Fore.YELLOW}Entering interactive mode. Type 'quit' to exit.{Style.RESET_ALL}\n")
    while True:
        try:
            user_input = input(f"{Fore.GREEN}Your question: {Style.RESET_ALL}").strip()
            if user_input.lower() in ('quit', 'exit', 'q'):
                print(f"{Fore.CYAN}Goodbye!{Style.RESET_ALL}")
                break
            if not user_input:
                continue
            run_query(user_input)
        except KeyboardInterrupt:
            print(f"\n{Fore.CYAN}Interrupted. Goodbye!{Style.RESET_ALL}")
            break


if __name__ == "__main__":
    import sys

    print_banner()

    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        interactive_mode()
    else:
        run_demo_queries()
