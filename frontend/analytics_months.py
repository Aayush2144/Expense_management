import os
import streamlit as st
from datetime import datetime
import requests
import pandas as pd
import altair as alt

API_URL = os.environ.get("API_URL", "http://localhost:8000").rstrip("/")

MONTH_ORDER = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]


def analytics_months_tab():
    st.title("Monthly Expense Analytics")

    col1, col2 = st.columns(2)
    with col1:
        year = st.selectbox("Select Year", [2023, 2024, 2025, 2026, 2027], index=1)
    with col2:
        st.write("")

    if st.button("Get Monthly Analytics"):
        payload = {"year": year}

        try:
            res = requests.post(f"{API_URL}/analytics/monthly/", json=payload, timeout=10)
            if res.status_code != 200:
                st.error(f"Backend returned error: {res.status_code}")
                return
            response = res.json()
        except Exception as e:
            st.error(f"Failed to connect to backend at {API_URL}: {e}")
            return

        if not response:
            st.info(f"No monthly expense data found for year {year}.")
            return

        # Convert API response to DataFrame
        data = {
            "Month": list(response.keys()),
            "Total": [response[month]["total"] for month in response],
            "Percentage": [response[month]["percentage"] for month in response]
        }
        df = pd.DataFrame(data)

        # Sort by month order
        df["Month"] = pd.Categorical(df["Month"], categories=MONTH_ORDER, ordered=True)
        df_sorted = df.sort_values("Month")

        # Quick stats
        total_expense = df_sorted["Total"].sum()
        max_expense = df_sorted["Total"].max()
        avg_expense = df_sorted["Total"].mean()

        stat_col1, stat_col2, stat_col3 = st.columns(3)
        stat_col1.metric("Total Expense", f"₹{total_expense:.2f}")
        stat_col2.metric("Max Expense", f"₹{max_expense:.2f}")
        stat_col3.metric("Average Expense", f"₹{avg_expense:.2f}")

        # Altair bar chart
        chart = alt.Chart(df_sorted).mark_bar().encode(
            x=alt.X('Month', sort=MONTH_ORDER),
            y='Percentage',
            color=alt.Color('Month', legend=None)
        ).properties(height=300)

        st.subheader(f"Monthly Expense Percentages for {year}")
        st.altair_chart(chart, use_container_width=True)

        # Scrollable dataframe
        df_display = df_sorted.copy()
        df_display["Total"] = df_display["Total"].map("{:.2f}".format)
        df_display["Percentage"] = df_display["Percentage"].map("{:.2f}%".format)
        st.subheader("Detailed Table")
        st.dataframe(df_display, use_container_width=True)
