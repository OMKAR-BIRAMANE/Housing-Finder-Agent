import pandas as pd
import requests
import json
import os
from langchain.tools import tool
from colorama import Fore, Style

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'chicago_housing_metrics.csv')

OSM_OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

ZIP_CENTROIDS = {
    60601: (41.8858, -87.6181),
    60602: (41.8829, -87.6278),
    60603: (41.8795, -87.6305),
    60604: (41.8765, -87.6301),
    60605: (41.8674, -87.6237),
    60606: (41.8835, -87.6376),
    60607: (41.8757, -87.6544),
    60608: (41.8475, -87.6623),
    60609: (41.8167, -87.6470),
    60610: (41.9005, -87.6366),
    60611: (41.8966, -87.6229),
    60612: (41.8793, -87.6896),
    60613: (41.9536, -87.6597),
    60614: (41.9218, -87.6459),
    60615: (41.8006, -87.5956),
    60616: (41.8439, -87.6237),
    60617: (41.7233, -87.5534),
    60618: (41.9469, -87.7059),
    60619: (41.7467, -87.6027),
    60620: (41.7388, -87.6480),
    60621: (41.7784, -87.6497),
    60622: (41.9025, -87.6778),
    60623: (41.8490, -87.7187),
    60624: (41.8793, -87.7243),
    60625: (41.9734, -87.7059),
    60626: (42.0085, -87.6693),
    60628: (41.6916, -87.6143),
    60629: (41.7784, -87.7095),
    60630: (41.9901, -87.7641),
    60631: (41.9991, -87.8128),
    60632: (41.8213, -87.7155),
    60633: (41.6573, -87.5418),
    60636: (41.7784, -87.6711),
    60637: (41.7784, -87.5996),
    60638: (41.7895, -87.7641),
    60639: (41.9204, -87.7641),
    60640: (41.9734, -87.6597),
    60641: (41.9536, -87.7641),
    60643: (41.6916, -87.6570),
    60644: (41.8793, -87.7641),
    60645: (42.0085, -87.6907),
    60647: (41.9218, -87.7059),
    60649: (41.7623, -87.5641),
    60651: (41.9025, -87.7395),
    60652: (41.7467, -87.7155),
    60653: (41.8167, -87.6027),
    60655: (41.6916, -87.7095),
    60657: (41.9401, -87.6459),
    60660: (41.9901, -87.6597),
    60827: (41.6384, -87.6143),
}


@tool
def search_affordable_neighborhoods(budget: int) -> str:
    """
    Searches the Chicago housing dataset for neighborhoods where the average
    monthly rent is at or below the given budget. Returns a formatted summary
    of matching neighborhoods including rent, crime rate, income, and available
    affordable housing units. Use this tool first to filter by budget.

    Args:
        budget: The user's maximum monthly rent budget in USD (integer).

    Returns:
        A formatted string listing all matching neighborhoods with key metrics,
        or a message indicating no matches were found.
    """
    print(f"{Fore.YELLOW}[Tool] Searching neighborhoods with budget: ${budget}/mo{Style.RESET_ALL}")
    try:
        df = pd.read_csv(DATA_PATH)
        df['Zip_Code'] = df['Zip_Code'].astype(int)
        matches = df[df['Avg_Monthly_Rent_USD'] <= budget].copy()
        matches = matches.sort_values('Crime_Rate_Per_10k')

        if matches.empty:
            cheapest = df.nsmallest(3, 'Avg_Monthly_Rent_USD')
            lines = ["No neighborhoods found within that budget. Closest options:"]
            for _, row in cheapest.iterrows():
                lines.append(
                    f"- {row['Neighborhood']} (ZIP {row['Zip_Code']}): "
                    f"${row['Avg_Monthly_Rent_USD']}/mo, "
                    f"Crime: {row['Crime_Rate_Per_10k']}/10k, "
                    f"Units available: {row['Affordable_Housing_Units_Available']}"
                )
            return "\n".join(lines)

        lines = [f"Found {len(matches)} neighborhood(s) within ${budget}/mo budget (sorted by crime rate, lowest first):\n"]
        for _, row in matches.iterrows():
            lines.append(
                f"- {row['Neighborhood']} (ZIP {row['Zip_Code']}): "
                f"${row['Avg_Monthly_Rent_USD']}/mo | "
                f"Crime: {row['Crime_Rate_Per_10k']}/10k | "
                f"Median income: ${row['Median_Household_Income_USD']:,} | "
                f"Affordable units: {row['Affordable_Housing_Units_Available']}"
            )
        return "\n".join(lines)

    except Exception as e:
        return f"Error reading housing data: {str(e)}"


@tool
def query_openstreetmap_amenities(zip_code: int) -> str:
    """
    Queries the live OpenStreetMap Overpass API to check real-world amenity
    availability near a given Chicago ZIP code. Checks for grocery stores,
    supermarkets, convenience stores, railway/train stations, pharmacies, and
    bus stops. Returns a livability score: GOOD (grocery AND transit present),
    FAIR (one of them), or POOR (neither). Use this after finding affordable
    neighborhoods to verify they are actually livable.

    Args:
        zip_code: A Chicago ZIP code (integer) to query for nearby amenities.

    Returns:
        A formatted string with amenity counts and a livability score.
    """
    print(f"{Fore.YELLOW}[Tool] Querying OSM amenities for ZIP: {zip_code}{Style.RESET_ALL}")

    coords = ZIP_CENTROIDS.get(int(zip_code))
    if not coords:
        return f"No coordinate data available for ZIP {zip_code}. Cannot query OSM."

    lat, lon = coords
    radius = 1500

    overpass_query = f"""
[out:json][timeout:25];
(
  node["shop"="supermarket"](around:{radius},{lat},{lon});
  node["shop"="grocery"](around:{radius},{lat},{lon});
  node["shop"="convenience"](around:{radius},{lat},{lon});
  node["railway"="station"](around:{radius},{lat},{lon});
  node["railway"="subway_entrance"](around:{radius},{lat},{lon});
  node["amenity"="pharmacy"](around:{radius},{lat},{lon});
  node["highway"="bus_stop"](around:{radius},{lat},{lon});
);
out body;
"""

    try:
        response = requests.post(
            OSM_OVERPASS_URL,
            data={'data': overpass_query},
            timeout=20,
            headers={'User-Agent': 'ChicagoHousingFinder/1.0'}
        )
        response.raise_for_status()
        data = response.json()
        elements = data.get('elements', [])

        grocery_count = 0
        transit_count = 0
        pharmacy_count = 0
        bus_count = 0

        for el in elements:
            tags = el.get('tags', {})
            shop = tags.get('shop', '')
            railway = tags.get('railway', '')
            amenity = tags.get('amenity', '')
            highway = tags.get('highway', '')

            if shop in ('supermarket', 'grocery', 'convenience'):
                grocery_count += 1
            if railway in ('station', 'subway_entrance'):
                transit_count += 1
            if amenity == 'pharmacy':
                pharmacy_count += 1
            if highway == 'bus_stop':
                bus_count += 1

        has_grocery = grocery_count > 0
        has_transit = transit_count > 0

        if has_grocery and has_transit:
            livability = "GOOD"
        elif has_grocery or has_transit:
            livability = "FAIR"
        else:
            livability = "POOR"

        result = (
            f"ZIP {zip_code} — Livability: {livability}\n"
            f"  Grocery/convenience stores: {grocery_count}\n"
            f"  Train/subway stations: {transit_count}\n"
            f"  Pharmacies: {pharmacy_count}\n"
            f"  Bus stops: {bus_count}\n"
            f"  ({len(elements)} total OSM nodes found within {radius}m)"
        )
        return result

    except requests.exceptions.Timeout:
        return (
            f"ZIP {zip_code} — OSM query timed out. "
            f"Using known fallback: Rogers Park (60626) has good grocery and transit access."
        )
    except Exception as e:
        return (
            f"ZIP {zip_code} — OSM query failed: {str(e)}. "
            f"Fallback reference: Rogers Park (60626) has grocery stores and Red Line access."
        )
